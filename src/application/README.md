# Application use cases (Issue 1 boundary)

Typed orchestration will live here in later issues. Use cases may import domain models and domain-owned ports but **not** MongoDB, Groq, object-store, framework request objects, or untrusted route parameters as authorization. The application cannot claim a currently authenticated owner until Issue 4 provides verified identity, and cannot serve a release until Issue 13 activates it with a live policy check (see specs 04, 05, 07, 08).

This directory intentionally has **no database access or enabled commands** in Issue 1.
