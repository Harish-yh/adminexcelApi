const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const pool = require('./module/db');
const app = express();
app.use(cors());
const port = 5050;

// Multer middleware setup
const upload = multer({ dest: 'uploads/' }); // Destination folder for uploaded files

// Utility function to convert Excel serial date to JavaScript date without milliseconds
function excelDateToJSDate(excelSerialDate) {
    const date = new Date(Math.round((excelSerialDate - 25569) * 86400 * 1000));
    const fractionalDay = excelSerialDate - Math.floor(excelSerialDate);
    const totalSeconds = Math.floor(86400 * fractionalDay);
    const seconds = totalSeconds % 60;
    const hours = Math.floor(totalSeconds / (60 * 60));
    const minutes = Math.floor((totalSeconds - (hours * 60 * 60)) / 60);
    date.setHours(hours, minutes, seconds, 0); // Set milliseconds to 0
    return date;
}

// Route to handle file upload
app.post('/upload', upload.single('xlsxFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No files were uploaded.');
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        console.log('Parsed JSON data:', jsonData); // Log the parsed JSON data

        const query = 
            `INSERT INTO admin_tbl (firstname, lastname, emailid, status, mobilenumber, password, confirmpassword, roletype, profile_img, status_id, created_date, updated_date) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;

        for (const row of jsonData) {
            const { firstname, lastname, emailid, status, mobilenumber, password, confirmpassword, roletype, profile_img, status_id, created_date, updated_date } = row;
            
            // Convert Excel serial dates to JavaScript dates
            const createdDateJS = created_date ? excelDateToJSDate(created_date) : null;
            const updatedDateJS = updated_date ? excelDateToJSDate(updated_date) : null;
            
            try {
                await pool.query(query, [firstname, lastname, emailid, status, mobilenumber, password, confirmpassword, roletype, profile_img, status_id, createdDateJS, updatedDateJS]);
            } catch (dbError) {
                console.error('Database insertion error:', dbError);
            }
        }

        res.send('Data imported successfully!');
    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).send('Error importing data.');
    }
});

app.listen(port, '192.168.6.57', () => {
    console.log(`Server is running on ${port}`);
});
