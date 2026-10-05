import { useEffect, useState } from "react";
import {
  FilePlus,
  Trash2,
  Upload,
  FileText,
  X,
} from "lucide-react";

import {
  createResource,
  deleteResource,
  listResources,
  resourceUrl,
} from "../../services/resources";

const categories = [
  "General",
  "Artificial Intelligence & Machine Learning",
  "Full Stack Development",
  "Data Structures & Algorithms",
  "Database Management",
  "Computer Networks",
  "Cyber Security",
  "Electronics",
  "Other",
];

export default function Resources() {
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
  });

  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await listResources();
      setRows(data);
    } catch (err) {
      console.error(err);
      setError("Could not load resources.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  function handleFileChange(e) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Only allow PDF
    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Only PDF files are allowed.");
      e.target.value = "";
      setFile(null);
      return;
    }

    // 20 MB maximum
    const maxSize = 20 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setError("PDF must be smaller than 20 MB.");
      e.target.value = "";
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  }

  function resetForm() {
    setForm({
      title: "",
      description: "",
      category: "General",
    });

    setFile(null);
    setError("");
  }

  async function save(e) {
    e.preventDefault();

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a title.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await createResource({
        title: form.title.trim(),
        description: form.description.trim(),
        resource_type: "PDF",
        category: form.category,
        file,
      });

      resetForm();
      setShowForm(false);

      await load();
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Could not upload the PDF. Check your Supabase Storage policies."
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(resource) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${resource.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteResource(resource.id, resource.file_url);
      await load();
    } catch (err) {
      console.error(err);
      alert("Could not delete the resource.");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow">Digital collection</div>

          <h1 className="mt-2 text-4xl font-black">
            Digital Resources
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            Upload and manage PDF books, notes, study materials,
            and other educational resources.
          </p>
        </div>

        {/* Add button */}
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setError("");
            }}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <FilePlus size={18} />
            Add PDF
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="card mt-7 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold">
                <Upload size={18} />
                Add Digital Resource
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Upload a PDF that students can access from the
                Digital Resources page.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={save} className="mt-6">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Title *
                </label>

                <input
                  className="input w-full"
                  required
                  placeholder="Example: Introduction to Machine Learning"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Category
                </label>

                <select
                  className="input w-full"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                className="input min-h-28 w-full"
                placeholder="Write a short description of this PDF..."
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />
            </div>

            {/* PDF */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold">
                PDF File *
              </label>

              <input
                className="input w-full"
                required
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
              />

              <p className="mt-2 text-xs text-slate-500">
                PDF only • Maximum size: 20 MB
              </p>

              {file && (
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <FileText className="text-red-500" size={20} />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {file.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="btn-secondary"
                disabled={busy}
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
                disabled={busy}
              >
                <Upload size={17} />

                {busy ? "Uploading PDF..." : "Upload PDF"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resource List */}
      <div className="card mt-7 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <div className="font-bold">Uploaded Resources</div>

            <div className="mt-1 text-xs text-slate-500">
              {rows.length} resource{rows.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {rows.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {rows.map((resource) => (
              <div
                key={resource.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-red-50 p-3 text-red-600">
                    <FileText size={20} />
                  </div>

                  <div>
                    <div className="font-semibold">
                      {resource.title}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      PDF · {resource.category}
                    </div>

                    {resource.description && (
                      <p className="mt-2 max-w-xl text-sm text-slate-500">
                        {resource.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    className="btn-secondary !p-2"
                    target="_blank"
                    rel="noreferrer"
                    href={resourceUrl(resource.file_url)}
                  >
                    View
                  </a>

                  <button
                    className="btn-secondary !p-2 text-rose-600"
                    onClick={() => remove(resource)}
                    title="Delete resource"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-500">
            No digital resources found.
          </div>
        )}
      </div>
    </div>
  );
}
