// Source: https://mrfreelancer9.medium.com/integrate-aws-s3-with-your-node-js-project-a-step-by-step-guide-f7f160ea8d29
// use.ts - File for utilizing AWS S3 functions
// Import the module for AWS S3 functions
import { uploadFileToAws, getFileUrlFromAws, awsFolderNames, deleteFileFromAws } from "./upload";




// Function to upload a file to AWS S3 bucket
export const uploadFileToAwsS3 = async (fileName: string) => {
    try {
        // Define the path where the file will be saved locally
        const savePath = `uploads/okay.txt`;
        
        // Upload the file to AWS S3 bucket in the specified subfolder
        await uploadFileToAws(`${awsFolderNames.sub1}/${fileName}`, `${savePath}`);
    } catch (error) {
        console.error("Error uploading file to AWS S3:", error);
        throw error;
    }
}




// Function to retrieve a file from AWS S3 bucket as a URL
export const getFileFromAwsS3 = async () => {
    try {
        const fileName = `okay.txt`; // Specify the file name

        // Get the file URL with default expiration time (15 minutes)
        const fileUrl = await getFileUrlFromAws(`${awsFolderNames.sub1}/${fileName}`, null);
        console.log("File URL:", fileUrl);

        // Set custom expiration time for the file URL (2 years from now)
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 2);
        const fileUrl1 = await getFileUrlFromAws(`${awsFolderNames.sub1}/${fileName}`, expirationDate);
        console.log("Custom Expiry File URL:", fileUrl1);
    } catch (error) {
        console.error("Error getting file from AWS S3:", error);
        throw error;
    }
}




// Function to delete a file from AWS S3 bucket
export const deleteFileFromAwsS3 = async () => {
    try {
        const fileName = `okay.txt`; // Specify the file name

        // Delete the specified file from AWS S3 bucket
        await deleteFileFromAws(`${awsFolderNames.logo}/${fileName}`);
    } catch (error) {
        console.error("Error deleting file from AWS S3:", error);
        throw error;
    }
}