# Dayflow Assistant (Dify)

AI HR helper for Dayflow, built on [Dify](https://dify.ai). It answers employee questions about leave, attendance, payroll and company policy, using `knowledge-base.md` as its only source of truth.

## Files

- `knowledge-base.md`: upload this to the Dify app's **Knowledge**. Part A describes how Dayflow works (checked against the code); Part B is company policy, and every `[EDIT]` value is a sample to replace with real rules.
- `system-prompt.md`: paste this into the Dify app's **Prompt** box.

## Uploading the knowledge file

- Use custom chunking with `==================================================` as the separator, so each section (A1, A2, …) becomes its own chunk.
- Re-upload the file whenever app behaviour or policy changes. Keep Part A in step with the code (for example, signup, leave and attendance rules).

## Quick tests (Dify Preview tab)

| Ask | Expected answer |
|---|---|
| Mujhe kitni leave milti hai? | 24 days per year, Remaining = 24 − Used |
| Approved leave cancel kar sakta hoon? | No, only Pending can be cancelled; contact HR |
| Payslip kaise download karun? | Payroll page → Download |
| A question not in the file | "Mujhe iski jaankari nahi hai, please HR team se contact karein." |

## Adding it to the website

Use Dify's **Publish → Embed** chat-bubble script in the frontend. Its token is public and safe to ship. Never put the Dify **API secret key** (`app-...`) in frontend code.
