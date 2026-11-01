async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api/${path}`, options);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Cannot reach the backend. Start FastAPI on 127.0.0.1:8000 and try again.",
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The backend returned an unexpected response. Check that FastAPI is running on port 8000.",
    );
  }
  if (!response.ok)
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Please check the message length and generation settings.",
    );
  return data;
}

export const getHealth = (signal) => request("health", { signal });
export const sendChat = (body, signal) =>
  request("chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
