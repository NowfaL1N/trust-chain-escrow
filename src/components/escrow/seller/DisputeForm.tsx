import { useState, useRef } from "react";
import { AlertOctagon, Upload, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE_MB = 5;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type Props = {
  onSubmit: (title: string, description: string, evidence: string, resolution: string) => void;
  onCancel: () => void;
};

export default function DisputeForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [resolution, setResolution] = useState("mediation");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const files = e.target.files;
    if (!files?.length) return;
    if (evidenceImages.length + files.length > MAX_IMAGES) {
      setUploadError(`You can add up to ${MAX_IMAGES} images.`);
      e.target.value = "";
      return;
    }
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setUploadError(`"${file.name}" is larger than ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }
      try {
        newUrls.push(await fileToDataUrl(file));
      } catch {
        setUploadError(`Could not read "${file.name}".`);
      }
    }
    setEvidenceImages((prev) => [...prev, ...newUrls].slice(0, MAX_IMAGES));
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setEvidenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    const evidence = evidenceImages.length > 0 ? JSON.stringify(evidenceImages) : "";
    onSubmit(title, description, evidence, resolution);
  };

  return (
    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-6 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center border border-rose-200 dark:border-rose-800 shrink-0">
          <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-rose-900 dark:text-rose-100">Raise a Dispute</h3>
          <p className="text-sm text-rose-700 dark:text-rose-300">
            Pause the transaction clock and involve mediation (45-day window).
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-rose-900 dark:text-rose-200 mb-1">Issue Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white"
            placeholder="e.g. Buyer rejecting delivery without cause"
          />
        </div>

        <div>
           <label className="block text-sm font-semibold text-rose-900 dark:text-rose-200 mb-1">Detailed Description</label>
           <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white resize-none"
            placeholder="Describe the issue in detail..."
           />
        </div>

        <div>
           <label className="block text-sm font-semibold text-rose-900 dark:text-rose-200 mb-1">Requested Resolution</label>
           <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white"
           >
             <option value="mediation">Require Arbitration / Mediation</option>
             <option value="release">Force Release Funds (Proof Submitted)</option>
             <option value="cancel">Cancel Order & Return Goods</option>
           </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-rose-900 dark:text-rose-200">Upload Evidence (pictures)</label>
          <p className="text-xs text-rose-600 dark:text-rose-400">Add up to {MAX_IMAGES} images. Max {MAX_FILE_SIZE_MB}MB each.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-rose-200 dark:border-rose-800 rounded-xl p-6 flex flex-col items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-100/50 dark:hover:bg-rose-900/20 transition-colors"
          >
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">Click to add pictures</span>
            <span className="text-xs">Photos, shipping manifests, tracking receipts</span>
          </button>
          {evidenceImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {evidenceImages.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt={`Evidence ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-rose-200 dark:border-rose-800" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-90 hover:opacity-100">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-rose-200 dark:border-rose-800 mt-6">
          <Button type="button" onClick={onCancel} variant="ghost" className="text-rose-700 hover:text-rose-800 hover:bg-rose-100">
            Cancel
          </Button>
          <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2">
            <Send className="w-4 h-4" /> Submit Dispute
          </Button>
        </div>
      </form>
    </div>
  );
}
