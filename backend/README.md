# Backend configuration

The backend reads its Gemini credentials from environment variables. Keep the key on the server; do not put it in frontend `.env` files, source code, or container build arguments.

## Local development

Set the variables in the shell that starts Spring Boot, then run the app from `backend`:

```powershell
$env:GEMINI_API_KEY = "your-key-from-Google-AI-Studio"
$env:GEMINI_MODEL = "gemini-3.8-flash"
./mvnw spring-boot:run
```

The API key is optional at startup so other backend functionality can still run without Gemini configured. The assistant endpoint returns a service unavailable response until the key is set.

## Deployment

Set `GEMINI_API_KEY` as a secret in the deployment platform's backend service environment. Set `GEMINI_MODEL` there only when choosing a different supported model. Do not bake the key into the Docker image or expose it as a `VITE_*` variable.

## Voice intent endpoint

`POST /api/assistant/interpret` requires the same JWT bearer authentication as other protected API routes. It accepts a JSON `transcript` up to 1000 characters and returns one validated, allowlisted navigation or task-filter intent. The endpoint is rate limited per authenticated username.
