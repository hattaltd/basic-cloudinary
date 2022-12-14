import express from 'express';
import cloudinary from './services/cloudinary.js';
import upload from './services/multer.js';


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.urlencoded({ limit: '30mb', extended: true}));

/* POST Single Image */
app.post('/upload-single-img', upload.single('image'), async (req, res) => {
    
    const options = {
        upload_preset: "s31ypadd",
        folder: "folder-project",
        resource_type: "image"
    };

    if(!req.file) return res.json({ success: false, message: 'No image selected. Please select an image.'})

    try {
        

        const response = await cloudinary.uploader.upload(req.file.path, options);
        console.log(response)
        if(response) {
            // console.log(result);
            const dateToConvert = new Date(response.created_at);
            const dateConverted = dateToConvert.toLocaleDateString("en-UK", {
                // timeZone: 'Asia/Kuala_Lumpur',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: 'numeric', // hour: numeric - 2-digit
                minute: 'numeric', // hour: numeric - 2-digit
                second: '2-digit', // hour: numeric - 2-digit
                hour12: true,
                timeZoneName: "short",
            });

            res.json({
                success: true,
                message: 'Success upload image to cloudinary',
                public_id: response.public_id,
                folder: response.folder,
                secure_url: response.secure_url,
                created_at: dateConverted
            })
        }
    } catch(err) {
        res.json({
            success: false,
            message: err.stack
        })
    }
    
});

/* POST Many Image */
app.post('/upload-three-img', upload.array('image', 6), async (req, res) => {
    
    try {
        const options = {
            upload_preset: "s31ypadd",
            folder: "folder-project",
            resource_type: "image"
        };

        let urls = [];
        const files = req.files;
        const uploader = async (path) => await cloudinary.uploader.upload(path, options);

        for (const file of files) {
            const { path } = file;
            const newPath = await uploader(path);
            
            urls.push({secure_url: newPath.secure_url, public_id: newPath.public_id})
                    
        }

        res.status(200).json({
            success: true,
            message: `${urls.length} Images has been uploaded successfully`,
            data: urls
        })

        
    } catch(err) {
        res.json({
            success: false,
            message: err
        })
        
    }
    
});

/* GET Check Existance of an Image */
app.get('/get-single-image-detail', async(req, res, next) => {

    const options = {
        public_id: 'folder-project/kbr4uqumyuwlmg4uhn5a',
    };

    try {
        // API resource: Accept one parameter
        const resp = await cloudinary.api.resource('folder-project/kbr4uqumyuwlmg4uhn5a');
        console.log(resp)
        if(resp) {
            res.json({
                success: true,
                message: 'Image exist',
                public_id:  resp.public_id,
                secure_url: resp.secure_url,
                created_at: resp.created_at,
                folder: resp.folder,
                rate_limit_allowed: resp.rate_limit_allowed,
                rate_limit_reset_at: resp.rate_limit_reset_at,
                rate_limit_remaining: resp.rate_limit_remaining

            })
        }
        
    } catch (error) {
        res.json({
            success: false,
            message: error
        })
        next();
    }
    

    
    
});

/* GET Check Lists All Folders */
app.get('/get-list-folders', async(req, res) => {

    const options = {
        public_id: 'folder-project/kbr4uqumyuwlmg4uhn5a',
    };

    try {
        // API resource: Accept one parameter
        const resp = await cloudinary.api.root_folders();
        if(resp) {
            res.json({
                success: true,
                message: 'List of folders found',
                folders: resp.folders,
                ttl_folders: resp.total_count
            })
        }

        
    } catch (error) {
        res.json({
            success: false,
            message: error
        })
    }
});

/* START Server */
const port = process.env.PORT || 4000;
app.listen(port, (err) => {

    if (!err) return console.log(`Server is running. PORT::: ${port}`);  

    if (err) return console.log(`Server failed to run. ${err}`);
});