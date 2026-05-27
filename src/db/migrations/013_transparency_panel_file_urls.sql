ALTER TABLE transparency_panel
  MODIFY fileUrl LONGTEXT,
  MODIFY fileName VARCHAR(255),
  MODIFY fileType VARCHAR(40),
  MODIFY mimeType VARCHAR(255),
  MODIFY slideImages LONGTEXT DEFAULT ('[]'),
  MODIFY description LONGTEXT;
