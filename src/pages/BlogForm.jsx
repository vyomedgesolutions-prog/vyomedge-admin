import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBlog, createBlog, updateBlog } from "../services/api";
import toast from "react-hot-toast";
import {
  HiOutlineArrowLeft,
  HiPlus,
  HiTrash,
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi";

const EDITOR_URL = "https://vyomedge-text-editor.vercel.app/embed";

const CATEGORIES = [
  "General",
  "SEO",
  "Marketing",
  "Web Development",
  "Social Media",
  "Case Study",
];

// ── FAQ Item Component ────────────────────────────────────────────────────────
function FaqItem({ faq, index, onChange, onRemove }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          {open ? (
            <HiChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
          ) : (
            <HiChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          )}
          <span className="text-sm font-medium truncate">
            {faq.question.trim() || `FAQ #${index + 1}`}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="ml-3 w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-500/20 transition-all shrink-0"
          title="Remove FAQ"
        >
          <HiTrash className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      {open && (
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1">
              Question *
            </label>
            <input
              type="text"
              value={faq.question}
              onChange={(e) => onChange(index, "question", e.target.value)}
              placeholder="e.g. What is the return policy?"
              className="w-full px-4 py-2 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1">
              Answer *
            </label>
            <textarea
              value={faq.answer}
              onChange={(e) => onChange(index, "answer", e.target.value)}
              placeholder="Write the answer here…"
              rows={3}
              className="w-full px-4 py-2 rounded-lg text-sm resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main BlogForm ─────────────────────────────────────────────────────────────
export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const editorRef = useRef(null);
  const [editorReady, setEditorReady] = useState(false);
  const pendingContentRef = useRef(null);
  const postRetryTimeoutsRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [content, setContent] = useState("");
  const [imageConverting, setImageConverting] = useState(false);
  const [initialData, setInitialData] = useState(null); // for change detection

  // ── FAQs state: array of { question, answer } ──
  const [faqs, setFaqs] = useState([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    category: "",
    tags: "",
    status: "draft",
    featuredImage: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
    scheduledAt: "",
  });

  /* ── post HTML into the iframe editor ── */
  const postEditorData = useCallback(
    (html) => {
      if (
        html === undefined ||
        html === null ||
        !editorRef.current?.contentWindow
      )
        return false;

      editorRef.current.contentWindow.postMessage(
        {
          type: "custom-text-editor:set-data",
          payload: {
            title: "Edited From Parent Website",
            html: html,
          },
        },
        "*",
      );
      return true;
    },
    [editorReady],
  );

  const clearScheduledPosts = useCallback(() => {
    postRetryTimeoutsRef.current.forEach(clearTimeout);
    postRetryTimeoutsRef.current = [];
  }, []);

  const scheduleEditorDataPost = useCallback(
    (html, place) => {
      if (html === undefined || html === null) return;

      clearScheduledPosts();
      postEditorData(html, `${place}:immediate`);

      [250].forEach((delay) => {
        const timeoutId = setTimeout(() => {
          postEditorData(html);
        }, delay);
        postRetryTimeoutsRef.current.push(timeoutId);
      });
    },
    [clearScheduledPosts, postEditorData],
  );

  /* ── listen for content updates from the iframe ── */
  useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== "object") return;
      const { type, payload } = e.data;
      if (type === "custom-text-editor:data" && payload?.html !== undefined)
        setContent(payload.html);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => clearScheduledPosts, [clearScheduledPosts]);

  useEffect(() => {
    if (initialData?.content === undefined) return;

    pendingContentRef.current = initialData.content;

    if (editorReady) {
      scheduleEditorDataPost(initialData.content, "initial-data-effect");
      pendingContentRef.current = null;
    }
  }, [initialData?.content, editorReady, scheduleEditorDataPost]);

  /* ── when editor becomes ready, flush any pending content ── */
  useEffect(() => {
    if (editorReady && pendingContentRef.current) {
      scheduleEditorDataPost(
        pendingContentRef.current,
        "flush-pending-content",
      );
      pendingContentRef.current = null;
    }
  }, [editorReady, scheduleEditorDataPost]);

  /* ── fetch existing blog in edit mode ── */
  useEffect(() => {
    if (!isEdit) return;
    getBlog(id)
      .then(({ data }) => {
        const blog = data.blog;
        setForm({
          title: blog.title || "",
          slug: blog.slug || "",
          excerpt: blog.excerpt || "",
          category: blog.category || "",
          tags: blog.tags?.join(", ") || "",
          status: blog.isPublished ? "published" : "draft",
          featuredImage: blog.featuredImage || "",
          seoTitle: blog.seoTitle || "",
          seoDescription: blog.seoDescription || "",
          seoKeywords: blog.seoKeywords || "",
          canonicalUrl: blog.canonicalUrl || "",
          scheduledAt: blog.scheduledAt ? blog.scheduledAt.slice(0, 16) : "",
        });
        const html = blog.content || "";
        setContent(html);
        setInitialData(blog);
        if (editorReady) scheduleEditorDataPost(html, "fetch-blog");
        else pendingContentRef.current = html;

        // load saved FAQs
        if (Array.isArray(blog.faqs)) setFaqs(blog.faqs);
      })
      .catch(() => toast.error("Failed to fetch blog"))
      .finally(() => setFetching(false));
  }, [id, isEdit, editorReady, scheduleEditorDataPost]);

  /* ── convert File to base64 data-URL ── */
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  /* ── handle image file upload → base64 ── */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageConverting(true);
    try {
      const base64 = await fileToBase64(file);
      setForm((f) => ({ ...f, featuredImage: base64 }));
      toast.success("Image ready!");
    } catch {
      toast.error("Failed to process image");
    } finally {
      setImageConverting(false);
      e.target.value = "";
    }
  };

  /* ── FAQ helpers ── */
  const addFaq = () =>
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);

  const updateFaq = (index, field, value) =>
    setFaqs((prev) =>
      prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)),
    );

  const removeFaq = (index) =>
    setFaqs((prev) => prev.filter((_, i) => i !== index));

  /* ── auto-derive slug & seoTitle from title ── */
  const handleTitleChange = (val) => {
    setForm((f) => ({
      ...f,
      title: val,
      slug:
        !isEdit || !f.slug
          ? val
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-")
              .trim()
          : f.slug,
      seoTitle: !f.seoTitle ? val : f.seoTitle,
    }));
  };

  const handleExcerptChange = (val) => {
    setForm((f) => ({
      ...f,
      excerpt: val,
      seoDescription: !f.seoDescription ? val : f.seoDescription,
    }));
  };

  const handleSlugChange = (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    setForm((f) => ({ ...f, slug: clean, canonicalUrl: `/blog/${clean}` }));
  };

  /* ── save ── */
  const handleSave = useCallback(
    async (statusOverride) => {
      const finalStatus = statusOverride || form.status;
      if (!form.title.trim()) {
        toast.error("Title is required");
        return;
      }

      // validate FAQs — both fields must be filled if a FAQ row exists
      const invalidFaq = faqs.find(
        (f) => !f.question.trim() || !f.answer.trim(),
      );
      if (invalidFaq) {
        toast.error("All FAQ questions and answers must be filled in");
        return;
      }

      setLoading(true);
      try {
        const payload = {
          ...form,
          content,
          faqs, // [{ question, answer }, ...]
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          status: finalStatus,
          isPublished: finalStatus === "published",
          canonicalUrl: form.canonicalUrl || `/blog/${form.slug}`,
          scheduledAt: form.scheduledAt || undefined,
        };

        if (isEdit) {
          await updateBlog(id, payload);
          toast.success("Blog updated!");
        } else {
          await createBlog(payload);
          toast.success("Blog created!");
        }
        navigate("/blogs");
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to save blog");
      } finally {
        setLoading(false);
      }
    },
    [form, content, faqs, isEdit, id, navigate],
  );

  const seoTitleLen = form.seoTitle.length;
  const seoDescLen = form.seoDescription.length;
  const isBase64Image = form.featuredImage?.startsWith("data:");

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* ── Top bar ── */}
      <button
        onClick={() => navigate("/blogs")}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <HiOutlineArrowLeft className="w-5 h-5" />
        Back to Blogs
      </button>

      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">
            {isEdit ? "Edit Blog Post" : "New Blog Post"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            All fields below are fully SEO-optimised
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => postEditorData(content, "manual upload")}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-sm"
          >
            upload
          </button>
          <button
            type="button"
            onClick={() => navigate("/blogs")}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={loading}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-sm disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={loading}
            className="px-6 py-2 bg-primary rounded-lg hover:bg-primary/80 transition-all font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "Publishing…" : "Publish Now"}
          </button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN ── */}
        <div className="xl:col-span-2 space-y-5">
          {/* Title */}
          <div className="glass rounded-xl p-5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Blog Post Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. How to Choose the Right Serum for Your Skin Type"
              required
              className="w-full px-4 py-3 rounded-lg text-lg font-semibold"
            />
            {form.slug && (
              <p className="text-xs text-gray-400 mt-1.5">
                URL:{" "}
                <span className="text-primary font-mono">
                  /blog/{form.slug}
                </span>
              </p>
            )}
          </div>

          {/* Rich Text Editor (iframe) */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Content *
              </label>
              {!editorReady && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full border-2 border-t-primary border-gray-600 animate-spin inline-block" />
                  Loading editor…
                </span>
              )}
            </div>
            <iframe
              ref={editorRef}
              src={EDITOR_URL}
              title="Blog Content Editor"
              onLoad={() => {
                setEditorReady(true);
                if (pendingContentRef.current !== null) {
                  scheduleEditorDataPost(
                    pendingContentRef.current,
                    "iframe-onload",
                  );
                  pendingContentRef.current = null;
                }
              }}
              className="w-full border-0"
              style={{ height: "520px" }}
              allow="clipboard-read; clipboard-write"
            />
          </div>

          {/* Excerpt */}
          <div className="glass rounded-xl p-5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Excerpt (Short Summary)
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => handleExcerptChange(e.target.value)}
              placeholder="A short description that appears in blog listings and search results (150–160 chars ideal)"
              rows={3}
              className="w-full px-4 py-3 rounded-lg resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.excerpt.length} chars
            </p>
          </div>

          {/* ── FAQ Section ── */}
          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold">FAQs</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Boost SEO with FAQ schema markup
                </p>
              </div>
              <button
                type="button"
                onClick={addFaq}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-xs font-semibold transition-all"
              >
                <HiPlus className="w-4 h-4" />
                Add FAQ
              </button>
            </div>

            {faqs.length === 0 ? (
              <div
                onClick={addFaq}
                className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-8 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <span className="text-3xl mb-2">💬</span>
                <p className="text-sm text-gray-400 font-medium">No FAQs yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  Click to add your first FAQ
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <FaqItem
                    key={index}
                    faq={faq}
                    index={index}
                    onChange={updateFaq}
                    onRemove={removeFaq}
                  />
                ))}

                <button
                  type="button"
                  onClick={addFaq}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-white/20 rounded-xl text-xs text-gray-400 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
                >
                  <HiPlus className="w-4 h-4" />
                  Add another FAQ
                </button>
              </div>
            )}

            {faqs.length > 0 && (
              <p className="text-[10px] text-gray-500 mt-3">
                {faqs.length} FAQ{faqs.length > 1 ? "s" : ""} · Saved as
                structured array in DB
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-5">
          {/* Publish Settings */}
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-bold mb-4">Publish Settings</h3>

            <div className="mb-3">
              <label className="text-xs font-medium text-gray-400 block mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            {form.status === "scheduled" && (
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-400 block mb-1">
                  Publish Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scheduledAt: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-lg text-sm"
                />
              </div>
            )}

            <div className="mb-3">
              <label className="text-xs font-medium text-gray-400 block mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg text-sm"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
                placeholder="tag1, tag2, tag3"
                className="w-full px-4 py-2 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-bold mb-4">Featured Image</h3>

            {form.featuredImage ? (
              <>
                <div className="relative rounded-lg overflow-hidden mb-2 aspect-video">
                  <img
                    src={form.featuredImage}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, featuredImage: "" }))
                    }
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
                {isBase64Image && (
                  <p className="text-[10px] text-primary font-mono mb-2 flex items-center gap-1">
                    <span>✓</span> Stored as base64
                  </p>
                )}
              </>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all mb-3">
                {imageConverting ? (
                  <>
                    <span className="w-6 h-6 rounded-full border-2 border-t-primary border-gray-600 animate-spin mb-2" />
                    <span className="text-xs text-gray-400">
                      Converting to base64…
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl mb-2">🖼️</span>
                    <span className="text-xs text-gray-400 text-center">
                      Click to upload featured image
                      <br />
                      (JPG, PNG, WebP · Max 5MB)
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}

            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1">
                Or paste image URL
              </label>
              <input
                type="url"
                value={isBase64Image ? "" : form.featuredImage}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featuredImage: e.target.value }))
                }
                placeholder="https://..."
                disabled={isBase64Image}
                className="w-full px-4 py-2 rounded-lg text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              />
              {isBase64Image && (
                <p className="text-[10px] text-gray-500 mt-1">
                  Remove uploaded image to paste a URL instead.
                </p>
              )}
            </div>
          </div>

          {/* SEO Meta Fields */}
          <div className="glass rounded-xl border border-primary/30 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">🔍</span>
              <h3 className="text-sm font-bold">SEO Meta Fields</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">
                  SEO Title{" "}
                  <span
                    className={`ml-1 font-semibold ${seoTitleLen > 60 ? "text-red-400" : seoTitleLen > 50 ? "text-yellow-400" : "text-primary"}`}
                  >
                    {seoTitleLen}/60
                  </span>
                </label>
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seoTitle: e.target.value }))
                  }
                  placeholder="SEO title (50–60 chars ideal)"
                  maxLength={70}
                  className="w-full px-4 py-2 rounded-lg text-sm"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Leave blank to use post title.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">
                  Meta Description{" "}
                  <span
                    className={`ml-1 font-semibold ${seoDescLen > 160 ? "text-red-400" : seoDescLen > 140 ? "text-yellow-400" : "text-primary"}`}
                  >
                    {seoDescLen}/160
                  </span>
                </label>
                <textarea
                  value={form.seoDescription}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seoDescription: e.target.value }))
                  }
                  placeholder="Compelling description for search engines (140–160 chars)"
                  rows={3}
                  maxLength={170}
                  className="w-full px-4 py-2 rounded-lg text-sm resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">
                  Focus Keywords
                </label>
                <input
                  type="text"
                  value={form.seoKeywords}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seoKeywords: e.target.value }))
                  }
                  placeholder="best serum for acne india, vitamin c serum"
                  className="w-full px-4 py-2 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={form.canonicalUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, canonicalUrl: e.target.value }))
                  }
                  placeholder="/blog/your-post-slug"
                  className="w-full px-4 py-2 rounded-lg text-sm font-mono"
                />
              </div>

              {(form.seoTitle || form.title) && (
                <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Google Preview
                  </p>
                  <p className="text-sm font-medium text-blue-400 truncate">
                    {form.seoTitle || form.title}
                  </p>
                  <p className="text-[10px] text-green-400 font-mono">
                    yoursite.com{form.canonicalUrl || `/blog/${form.slug}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                    {form.seoDescription ||
                      form.excerpt ||
                      "No description set"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* URL Slug */}
          <div className="glass rounded-xl p-5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
              URL Slug
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="post-url-slug"
              className="w-full px-4 py-2 rounded-lg text-sm font-mono"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Auto-generated from title. Only use lowercase, numbers, hyphens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
