import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { sendBrief } from "../api";

export default function Brief() {
  const [params] = useSearchParams();
  const plan = params.get("plan");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [idea, setIdea] = useState("");
  const [status, setStatus] = useState("");

  async function submit(e) {
    e.preventDefault();
    setStatus("Sending...");

    try {
      await sendBrief({ name, email, idea, plan });
      setStatus("✅ Sent! I’ll contact you soon.");
      setName("");
      setEmail("");
      setIdea("");
    } catch (err) {
      setStatus("❌ Failed to send. Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="bg-zinc-950 border border-gray-800 rounded-2xl p-8 max-w-lg w-full"
      >
        <h1 className="text-3xl font-bold mb-2">Project Brief</h1>
        <p className="text-gray-400 mb-6">
          Selected plan: <span className="capitalize text-white">{plan}</span>
        </p>

        <input
          className="w-full mb-4 p-3 rounded-lg bg-black border border-gray-700"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="w-full mb-4 p-3 rounded-lg bg-black border border-gray-700"
          placeholder="Your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <textarea
          className="w-full mb-4 p-3 rounded-lg bg-black border border-gray-700 min-h-[120px]"
          placeholder="Describe your idea / requirements"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          required
        />

        <button className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition">
          Send Idea →
        </button>

        {status && <p className="mt-4 text-center">{status}</p>}
      </form>
    </div>
  );
}
