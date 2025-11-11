import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

const UploadZone = () => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const validFiles = files.filter(file => validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx'));

    if (validFiles.length === 0) {
      toast.error("Please upload CSV or XLSX files only");
      return;
    }

    if (validFiles.some(file => file.size > 50 * 1024 * 1024)) {
      toast.error("File size must be less than 50MB");
      return;
    }

    // Placeholder - will implement with Lovable Cloud
    toast.info("File upload will be enabled with Lovable Cloud");
    console.log("Files to upload:", validFiles);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      }`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".csv,.xlsx"
        multiple
        onChange={handleFileInput}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-primary/10 p-4">
            {isDragging ? (
              <FileSpreadsheet className="h-8 w-8 text-primary" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">
              {isDragging ? "Drop your files here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-sm text-muted-foreground">CSV or XLSX files (max 50MB)</p>
          </div>
        </div>
      </label>
    </div>
  );
};

export default UploadZone;
