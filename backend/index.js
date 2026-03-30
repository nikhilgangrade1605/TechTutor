import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually from .env file
const envPath = path.join(__dirname, ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};

envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim();
    if (key) {
      envVars[key.trim()] = value;
    }
  }
});

// Set environment variables
Object.assign(process.env, envVars);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 } });

// Debug: Check if environment variables are loaded
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("❌ Error: SUPABASE_URL or SUPABASE_KEY not found in .env file");
  process.exit(1);
}

// regular client (read-only / anon)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// admin/client with service role key used for storage operations and bucket management
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// Route: Create a new course
app.post("/course", async (req, res) => {
  try {
    const { title, description, instructor } = req.body;

    if (!title || !description || !instructor) {
      return res.status(400).json({ error: "Title, description, and instructor are required" });
    }

    const { data, error } = await supabase
      .from("courses")
      .insert([{ title, description, instructor }])
      .select();

    if (error) {
      console.error("Error creating course:", error);
      return res.status(500).json({ error: "Failed to create course", details: error });
    }

    res.json(data);
  } catch (err) {
    console.error("Server error creating course:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Route: Get all courses
app.get("/courses", async (req, res) => {
  try {
    const { data, error } = await supabase.from("courses").select("*");

    if (error) {
      console.error("Error fetching courses:", error);
      return res.status(500).json({ error: "Failed to fetch courses", details: error });
    }

    res.json(data || []);
  } catch (err) {
    console.error("Server error fetching courses:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Route: Enroll a user in a course
app.post("/enroll", async (req, res) => {
  const { user_id, course_id } = req.body;

  const { data } = await supabase
    .from("enrollments")
    .insert([{ user_id, course_id }]);

  res.json(data);
});

// helper that ensures the bucket exists and is public
async function ensureBucket(name) {
  try {
    console.log(`🔍 Checking if bucket '${name}' exists...`);
    const { data: bucket, error } = await supabaseAdmin.storage.getBucket(name);
    
    if (error) {
      if (error.status === 404) {
        console.log(`📂 Bucket '${name}' not found, attempting to create...`);
        try {
          const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket(name, { 
            public: true,
            fileSizeLimit: 104857600 // 100MB
          });
          
          if (createError) {
            console.warn(`⚠️  Could not auto-create bucket '${name}': ${createError.message}`);
            console.log(`📝 Please create the '${name}' bucket manually in Supabase dashboard`);
            return false;
          }
          console.log(`✅ Bucket '${name}' created successfully`);
          return true;
        } catch (e) {
          console.warn(`⚠️  Bucket creation failed for '${name}'. Please create it manually in Supabase.`);
          return false;
        }
      } else {
        console.error(`❌ Error checking bucket '${name}':`, error.message);
        return false;
      }
    } else {
      console.log(`✅ Bucket '${name}' already exists`);
      return true;
    }
  } catch (e) {
    console.error(`❌ Exception checking bucket '${name}':`, e.message);
    return false;
  }
}

// Route to manually check/create buckets
app.post("/check-buckets", async (req, res) => {
  try {
    console.log("🔍 Checking/Creating buckets...");
    const videosBucketOk = await ensureBucket("videos");
    const materialsBucketOk = await ensureBucket("materials");
    
    res.json({
      success: videosBucketOk && materialsBucketOk,
      videoBucket: videosBucketOk,
      materialBucket: materialsBucketOk,
      message: "Bucket check complete. If buckets show false, please create them manually in Supabase dashboard.",
      instructions: "Visit: https://app.supabase.com → Storage → Create Bucket (name: 'videos', 'materials', set to public)"
    });
  } catch (err) {
    console.error("❌ Bucket check error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Initialize buckets at startup (but don't fail if they don't exist)
console.log("\n🚀 Initializing buckets at startup...");
ensureBucket("videos").then(ok => {
  if (!ok) console.log("⚠️  Please ensure 'videos' bucket exists in Supabase");
});
ensureBucket("materials").then(ok => {
  if (!ok) console.log("⚠️  Please ensure 'materials' bucket exists in Supabase");
});

// Route: Upload a video
app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const { courseId, title } = req.body;
    const fileName = `${courseId}/${Date.now()}-${req.file.originalname}`;

    // Upload to Supabase storage using admin client (service key) so that
    // anonymous requests are not required to have write permissions.
    const { data, error } = await supabaseAdmin.storage
      .from("videos")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error("Upload error (supabaseAdmin):", error);
      return res.status(500).json({ error: error.message, details: error });
    }

    // Get public URL
    const { data: publicData, error: publicError } = supabaseAdmin.storage
      .from("videos")
      .getPublicUrl(fileName);

    if (publicError) {
      console.error("Public URL error:", publicError);
      // non-fatal: still return success and file name, the frontend can build URL if bucket is public
    }

    res.json({
      success: true,
      fileName: fileName,
      publicUrl: publicData?.publicUrl,
      message: "File uploaded successfully"
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Route: Upload study materials (PDF, documents, etc.)
app.post("/upload-material", upload.single("material"), async (req, res) => {
  try {
    console.log("📥 Material upload request received");
    console.log("File:", req.file ? `${req.file.originalname} (${req.file.size} bytes)` : "No file");
    console.log("Body:", req.body);

    if (!req.file) {
      console.error("❌ No file provided in request");
      return res.status(400).json({ error: "No file provided. Please select a file to upload." });
    }

    const { courseId, title } = req.body;

    if (!courseId || !title) {
      console.error("❌ Missing courseId or title");
      return res.status(400).json({ error: "Course ID and title are required" });
    }

    const fileName = `${courseId}/${Date.now()}-${req.file.originalname}`;

    console.log(`📤 Uploading to materials bucket: ${fileName}`);

    // Ensure bucket exists before upload
    const bucketExists = await ensureBucket("materials");
    if (!bucketExists) {
      console.error("❌ Materials bucket not available");
      return res.status(500).json({ 
        error: "Materials storage not available. Please try again or contact support." 
      });
    }

    // Upload to Supabase storage using admin client (service key)
    const { data, error } = await supabaseAdmin.storage
      .from("materials")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error("❌ Upload error (supabaseAdmin):", error);
      
      // If bucket not found, try to create it
      if (error.message && error.message.includes("not found")) {
        console.log("📂 Attempting to create materials bucket...");
        await ensureBucket("materials");
        
        // Retry upload
        const { data: retryData, error: retryError } = await supabaseAdmin.storage
          .from("materials")
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false
          });
        
        if (retryError) {
          console.error("❌ Retry upload also failed:", retryError);
          return res.status(500).json({ 
            error: `Upload failed even after bucket creation: ${retryError.message}`
          });
        }
        
        console.log("✅ File uploaded successfully on retry");
        const { data: publicData } = supabaseAdmin.storage
          .from("materials")
          .getPublicUrl(fileName);

        return res.json({
          success: true,
          fileName: fileName,
          publicUrl: publicData?.publicUrl,
          message: "Study material uploaded successfully"
        });
      }
      
      return res.status(500).json({ 
        error: `Upload failed: ${error.message}`,
        details: error 
      });
    }

    console.log("✅ File uploaded successfully");

    // Get public URL
    const { data: publicData, error: publicError } = supabaseAdmin.storage
      .from("materials")
      .getPublicUrl(fileName);

    if (publicError) {
      console.error("Public URL error:", publicError);
    }

    res.json({
      success: true,
      fileName: fileName,
      publicUrl: publicData?.publicUrl,
      message: "Study material uploaded successfully"
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// Route: Get course details (enrolled students, materials, videos)
app.get("/course-details/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log(`📋 Fetching details for course ${courseId}`);

    // Get course info
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseError) {
      console.error("Course fetch error:", courseError);
      return res.status(404).json({ error: "Course not found" });
    }

    // Get enrolled students
    const { data: enrollments, error: enrollError } = await supabase
      .from("enrollments")
      .select("user_id")
      .eq("course_id", courseId);

    if (enrollError) {
      console.error("Enrollments fetch error:", enrollError);
    }

    // Get videos from storage
    let videos = [];
    try {
      const { data: videoFiles, error: videoError } = await supabaseAdmin.storage
        .from("videos")
        .list(courseId);

      if (!videoError && videoFiles) {
        videos = videoFiles.map(file => ({
          name: file.name,
          size: file.metadata?.size || 0,
          url: supabaseAdmin.storage.from("videos").getPublicUrl(`${courseId}/${file.name}`).data.publicUrl,
          uploadedAt: file.created_at
        }));
      }
    } catch (e) {
      console.warn("Videos fetch error:", e.message);
    }

    // Get materials from storage
    let materials = [];
    try {
      const { data: materialFiles, error: materialError } = await supabaseAdmin.storage
        .from("materials")
        .list(courseId);

      if (!materialError && materialFiles) {
        materials = materialFiles.map(file => ({
          name: file.name,
          size: file.metadata?.size || 0,
          url: supabaseAdmin.storage.from("materials").getPublicUrl(`${courseId}/${file.name}`).data.publicUrl,
          uploadedAt: file.created_at
        }));
      }
    } catch (e) {
      console.warn("Materials fetch error:", e.message);
    }

    res.json({
      course,
      enrolledStudents: enrollments || [],
      videos,
      materials
    });

  } catch (err) {
    console.error("❌ Course details error:", err);
    res.status(500).json({ error: err.message });
  }
});
