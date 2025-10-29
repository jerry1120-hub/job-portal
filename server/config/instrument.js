import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// ✅ Initialize Sentry with profiling enabled (compulsory)
Sentry.init({
  dsn: "https://7b8ea5e4e0e4a41a94e1ec5109c674b3@o4506818185486336.ingest.us.sentry.io/4506818185486336",
  integrations: [
    nodeProfilingIntegration(), // profiling is now required, not optional
    Sentry.mongooseIntegration()
  ],
  // Performance + profiling
  // tracesSampleRate: 1.0,  // capture 100% of transactions
  profilesSampleRate: 1.0, // collect profiles for 100% of transactions
});

// ✅ Start a Sentry span using the new API (v8 syntax)
Sentry.startSpan({ name: "server-startup" }, () => {
  console.log("✅ Sentry profiling and tracing started successfully");
  
  // Example simulated operation
  setTimeout(() => {
    console.log("✅ Profiling complete — no crashes");
  }, 300);
});
