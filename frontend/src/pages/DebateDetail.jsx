import React, { useState, useMemo,useEffect } from "react";

import { useParams, Link } from "react-router-dom";
import {
  Bookmark,
  Share2,
  MoreHorizontal,
  Disc3,
  Guitar,
  Drum,
  Star,
  Check,
  ChevronRight,
  Heart,
  MessageCircle,
  ChevronDown,
  Target,
  Flame,
} from "lucide-react";

import { getDebateById,getCommentsByDebateId,createComment } 
from "../services/debateService";

const ICON_MAP = {
  disc: Disc3,
  guitar: Guitar,
  drum: Drum,
  star: Star,
};

/* ---------------------------
   Option Card
----------------------------*/
function OptionCard({ opt, selected, onSelect }) {
  const Icon = ICON_MAP[opt.icon] || Disc3;

  return (
    <button
      onClick={() => onSelect(opt.letter)}
      className={`card-panel p-5 text-left relative transition-all ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "hover:border-[var(--border-2)]"
      }`}
    >
      <div
        className="absolute top-4 left-4 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        {opt.letter}
      </div>

      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
          <Check size={13} className="text-white" strokeWidth={3} />
        </div>
      )}

      <div className="flex justify-end mb-4">
        <Icon size={42} className="text-[var(--accent-2)]" strokeWidth={1.5} />
      </div>

      <div className="font-medium text-[14.5px] mb-1">{opt.title}</div>
      <div className="text-[11.5px] text-[var(--text-muted)] mb-4">
        {opt.desc || "—"}
      </div>

      <div className="flex justify-between text-[12px] mb-1.5">
        <span className="font-semibold">{opt.pct}%</span>
        <span className="text-[var(--text-muted)]">
          {opt.votes.toLocaleString()} votes
        </span>
      </div>

      <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${opt.pct}%`,
            background: "var(--accent)",
          }}
        />
      </div>
    </button>
  );
}

/* ---------------------------
   Reply Card
----------------------------*/
function ReplyCard({ c, onLike, liked }) {
  return (
    <div className="ml-12 pl-5 border-l border-[var(--border)]">
      <div className="flex gap-3">
        <div
          className="w-9 h-9 rounded-full border"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${c.avatarColor}, #1a1612)`,
          }}
        />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-[13px]">{c.author}</span>
            <span className="text-[11px] text-[var(--text-dim)]">
              · {c.time}
            </span>
          </div>

          <p className="text-[13px] text-[var(--text)]/90">{c.text}</p>

          <button
            onClick={() => onLike(c.id)}
            className="mt-2 flex items-center gap-1 text-[12px]"
          >
            <Heart
              size={13}
              className={
                liked ? "text-[var(--accent-2)] fill-[var(--accent-2)]" : ""
              }
            />
            {c.likes + (liked ? 1 : 0)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------
   Comment Card
----------------------------*/
function CommentCard({ c, onLike, likedMap }) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div>
      <div className="flex gap-3">
        <div
          className="w-10 h-10 rounded-full border"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${c.avatarColor}, #1a1612)`,
          }}
        />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-[13.5px]">{c.author}</span>
            <span className="text-[11px] text-[var(--text-dim)]">
              · {c.time}
            </span>
          </div>

          <p className="text-[13px] text-[var(--text)]/90">{c.text}</p>

          <div className="flex gap-4 mt-3">
            <button onClick={() => onLike(c.id)}>
              <Heart
                size={13}
                className={
                  likedMap[c.id]
                    ? "text-[var(--accent-2)] fill-[var(--accent-2)]"
                    : ""
                }
              />
              {c.likes + (likedMap[c.id] ? 1 : 0)}
            </button>

            <button onClick={() => setShowReply(!showReply)}>
              <MessageCircle size={13} /> Reply
            </button>
          </div>

          {showReply && (
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2 text-[12px]"
                placeholder="Write a reply..."
              />
              <button className="btn-accent px-3 text-[12px]">Send</button>
            </div>
          )}
        </div>
      </div>

      {c.replies?.map((r) => (
        <ReplyCard
          key={r.id}
          c={r}
          onLike={onLike}
          liked={likedMap[r.id]}
        />
      ))}
    </div>
  );
}

/* ---------------------------
   Main Component
----------------------------*/
export default function DebateDetail() {
  const { id } = useParams();

  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);

  const [vote, setVote] = useState(null);
  const [likedComments, setLikedComments] = useState({});
  const [activeTab, setActiveTab] = useState("Top");

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  /* ---------------------------
     Fetch debate
  ----------------------------*/
  useEffect(() => {
    async function fetchDebate() {
      setLoading(true);

      try {
        const data = await getDebateById(id);
        setD(data);
      } catch (err) {
        console.error("Failed to load debate:", err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchComments() {
      setLoading(true);

      try {
        const data = await getCommentsByDebateId(id);
        console.log("comments", data);
        setComments(data);
      } catch (err) {
        console.error("Failed to load debate:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDebate();
    fetchComments();
  }, [id]);

const [postingComment, setPostingComment] = useState(false);

const handleAddComment = async () => {
  if (!commentText.trim()) return;

  try {
    setPostingComment(true);

    const newComment = await createComment(id, {
      text: commentText,
      author: "anonymous",
      parent_comment_id: null,
    });

    setComments((prev) => [newComment, ...prev]);
    setCommentText("");
  } catch (error) {
    console.error(error);
  } finally {
    setPostingComment(false);
  }
};

  /* ---------------------------
     Derived options (safe)
  ----------------------------*/
  const options = useMemo(() => {
    if (!d?.options) return [];

    const totalVotes = d.options.reduce((s, o) => s + o.votes, 0);

    return d.options.map((o, i) => ({
      ...o,
      letter: String.fromCharCode(65 + i),
      title: o.label,
      desc: "",
      pct: totalVotes ? ((o.votes / totalVotes) * 100).toFixed(1) : 0,
      icon: i === 0 ? "disc" : "guitar",
    }));
  }, [d]);

  const total = options.reduce((s, o) => s + o.votes, 0);
  const selectedOpt = options.find((o) => o.letter === vote);

  /* ---------------------------
     Donut segments
  ----------------------------*/
  let cumulative = 0;
  const colors = ["#56536b", "#a78bfa", "#8b5cf6", "#6d28d9"];

  const segments = options.map((o, i) => {
    const start = cumulative;
    const pct = total ? (o.votes / total) * 100 : 0;
    cumulative += pct;

    return {
      start,
      end: cumulative,
      color: colors[i % colors.length],
      label: o.letter,
      votes: o.votes,
      pct,
    };
  });

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
    };
  };

  
  const arcPath = (cx, cy, r, startPct, endPct) => {
    const startA = (startPct / 100) * 360;
    const endA = (endPct / 100) * 360;

    const s = polarToCartesian(cx, cy, r, endA);
    const e = polarToCartesian(cx, cy, r, startA);
    const large = endA - startA > 180 ? 1 : 0;

    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
  };

  /* ---------------------------
     Loading state
  ----------------------------*/
  if (loading || !d) {
    return <div className="p-6">Loading debate...</div>;
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-7">
        <Link to="/debates">← Back</Link>

        {/* Hero */}
        <div className="card-panel p-7">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={13} className="text-red-500" />
            <span className="uppercase text-red-500 text-xs">{d.badge}</span>
          </div>

          <h1 className="text-3xl font-serif">{d.title}</h1>
          <p className="text-sm text-[var(--text-muted)]">{d.subtitle}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          {options.map((opt) => (
            <OptionCard
              key={opt.letter}
              opt={opt}
              selected={vote === opt.letter}
              onSelect={setVote}
            />
          ))}
        </div>

        {/* Comments */}
        <div className="space-y-6">
          {comments.map((c) => (
            <CommentCard
              key={c.id}
              c={c}
              onLike={(id) =>
                setLikedComments((p) => ({ ...p, [id]: !p[id] }))
              }
              likedMap={likedComments}
            />
          ))}
        </div>

        <div className="sticky bottom-0 z-20 mt-7 card-panel p-4 flex gap-3 bg-[var(--panel)] border-t border-[var(--border)]">
          <div
            className="w-9 h-9 rounded-full shrink-0"
            style={{
              background: "linear-gradient(135deg, #c2a876, #3a2a1a)",
            }}
          />

          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your take on this debate..."
            className="flex-1 bg-transparent border-0 text-[13px] focus:outline-none placeholder:text-[var(--text-dim)]"
          />

          <button
            onClick={handleAddComment}
            className="btn-accent rounded-lg px-4 text-[12.5px]"
          >
            Post
          </button>
        </div>

      </div>

     

      {/* Right rail */}
      <aside className="w-[280px] hidden xl:block">
        <div className="card-panel p-5">
          <div className="text-xs uppercase mb-3">Results</div>

          <svg viewBox="0 0 100 100" className="w-[120px] h-[120px]">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="var(--border)"
              strokeWidth="14"
            />

            {segments.map((s, i) => (
              <path
                key={i}
                d={arcPath(50, 50, 40, s.start, s.end)}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
              />
            ))}
          </svg>

          <div className="text-center mt-2">{d.totalVotes} votes</div>
        </div>
      </aside>
    </div>
  );
}