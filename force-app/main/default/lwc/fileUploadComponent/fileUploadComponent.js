import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveFileLogs from '@salesforce/apex/FileUploadController.saveFileLogs';
import getFileUploadLogs from '@salesforce/apex/FileUploadController.getFileUploadLogs';
import { refreshApex } from '@salesforce/apex';

export default class FileUploadComponent extends LightningElement {
    selectedFileType;
    fileUploadLogs;
    parentRecordId;
    documentFolderId;
    columns = [
        { label: 'File Name', fieldName: 'File_Name__c', type: 'text' },
        { label: 'File Type', fieldName: 'File_Type__c', type: 'text' },
        { label: 'Upload Date', fieldName: 'Upload_Date__c', type: 'date' },
        { label: 'File URL', fieldName: 'File_URL__c', type: 'url' },
        { label: 'File Reference ID', fieldName: 'File_Ref_Id__c', type: 'text' }
    ];

    fileTypeOptions = [
        { label: 'Files', value: 'Files' },
        { label: 'Document', value: 'Document' },
        { label: 'Attachment', value: 'Attachment' }
    ];

    selectedFile;
    fileContent;
    wiredFileUploadLogs;

    @wire(getFileUploadLogs)
    wiredFileUploadLogs(result) {
        this.wiredFileUploadLogs = result;
        if (result.data) {
            this.fileUploadLogs = result.data;
        } else if (result.error) {
            this.showToast('Error', result.error.body.message, 'error');
        }
    }

    get isDocumentType() {
        return this.selectedFileType === 'Document';
    }

    handleFileTypeChange(event) {
        this.selectedFileType = event.detail.value;
        // Reset parentRecordId when switching to Document type
        if (this.selectedFileType === 'Document') {
            this.parentRecordId = null;
        }
    }

    handleParentRecordIdChange(event) {
        this.parentRecordId = event.target.value;
    }

    handleDocumentFolderIdChange(event) {
        this.documentFolderId = event.target.value;
    }

    handleFileChange(event) {
        this.selectedFile = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            this.fileContent = reader.result.split(',')[1];
        };
        // encode the file content 
        reader.readAsDataURL(this.selectedFile);
    }

    handleUpload() {
        if (this.selectedFile && this.fileContent) {
            saveFileLogs({
                fileName: this.selectedFile.name,
                fileType: this.selectedFileType,
                fileContent: this.fileContent,
                parentRecordId: this.parentRecordId,
                documentFolderId: this.documentFolderId
            })
            .then(() => {
                this.showToast('Success', 'File uploaded successfully', 'success');
                return refreshApex(this.wiredFileUploadLogs);
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
        } else {
            this.showToast('Error', 'Please select a file to upload.', 'error');
        }
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(evt);
    }
}

