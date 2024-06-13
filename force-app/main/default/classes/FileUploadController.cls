/**
 * @description       : 
 * @author            : VIKASH MUNDARI
 * @group             : 
 * @last modified on  : 06-13-2024
 * @last modified by  : VIKASH MUNDARI
**/
public with sharing class FileUploadController {
    @AuraEnabled
    public static void saveFileLogs(String fileName, String fileType, String fileContent, String parentRecordId, String documentFolderId) {
        File_Upload_Log__c log = new File_Upload_Log__c();
        log.Name = fileName;
        log.File_Type__c = fileType;
        log.File_Name__c = fileName;
        log.Upload_Date__c = System.now();
        
        if (fileType == 'Attachment') {
            Attachment attachment = new Attachment();
            attachment.Name = fileName;
            attachment.Body = EncodingUtil.base64Decode(fileContent);
            attachment.ParentId = parentRecordId;
            insert attachment;
            log.File_Ref_Id__c = attachment.Id;
            log.File_URL__c = '/servlet/servlet.FileDownload?file=' + attachment.Id;
        } else if (fileType == 'Document') {
            Document document = new Document();
            document.Name = fileName;
            document.Body = EncodingUtil.base64Decode(fileContent);
            document.FolderId = documentFolderId;
            insert document;
            log.File_Ref_Id__c = document.Id;
            log.File_URL__c = '/sfc/servlet.shepherd/document/download/' + document.Id;
        } else if (fileType == 'Files') {
            ContentVersion contentVersion = new ContentVersion();
            contentVersion.Title = fileName;
            contentVersion.PathOnClient = fileName;
            contentVersion.VersionData = EncodingUtil.base64Decode(fileContent);
            contentVersion.FirstPublishLocationId = parentRecordId;
            insert contentVersion;
            log.File_Ref_Id__c = contentVersion.Id;
            log.File_URL__c = '/sfc/servlet.shepherd/version/download/' + contentVersion.Id;
        }
        
        insert log;
    }
    @AuraEnabled(cacheable=true)
    public static List<File_Upload_Log__c> getFileUploadLogs() {
        return [SELECT Id, Name, File_Type__c, File_Name__c, Upload_Date__c, File_URL__c, File_Ref_Id__c FROM File_Upload_Log__c ORDER BY Upload_Date__c DESC];
    }
}























