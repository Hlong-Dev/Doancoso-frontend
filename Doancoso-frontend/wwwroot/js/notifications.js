// Check if browser supports WebSocket
if (!("WebSocket" in window)) {
    alert("WebSocket is not supported by this browser.");
} else {
    // Get userId from JWT Token
    var token = localStorage.getItem('token'); // Retrieve token from localStorage
    var tokenPayload = decodeJwt(token);
    var userId = tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

    // WebSocket connection URL with userId
    var socket = new WebSocket("ws://localhost:5233/ws?userId=" + userId);

    socket.onopen = function (event) {
        console.log("WebSocket is open now.");
    };

    socket.onmessage = function (event) {
        console.log("WebSocket message received: ", event.data);
        try {
            var notification = JSON.parse(event.data);
            displayNotification(notification.Text, notification.Slug, true);
        } catch (error) {
            console.error("Error parsing WebSocket message as JSON: ", error);
        }
    };

    socket.onclose = function (event) {
        console.log("WebSocket is closed now.");
    };

    socket.onerror = function (error) {
        console.error("WebSocket error: ", error);
    };

    // Fetch and display existing notifications
    fetchNotifications(userId);
}

function displayNotification(message, slug, showPopup) {
    var notificationsDiv = document.getElementById("notifications");
    if (notificationsDiv) {
        var newNotification = document.createElement("div");
        newNotification.className = "notification";
        newNotification.innerHTML = `
                    <img src="path/to/icon.png" alt="User Icon" width="40" height="40">
                    <div class="notification-text">${message}</div>
                `;
        newNotification.onclick = function () {
            window.location.href = `http://localhost:5236/Home/single?slug=${slug}`;
        };
        notificationsDiv.appendChild(newNotification);
    }

    // Hiển thị pop-up thông báo nếu được phép
    if (showPopup) {
        showPopupNotification(message, slug);
    }
}

function showPopupNotification(message, slug) {
    var container = document.getElementById("notification-popup-container");
    if (!container) {
        console.error("notification-popup-container element not found.");
        return;
    }

    var popup = document.createElement("div");
    popup.className = "notification-popup";
    popup.textContent = message;
    popup.onclick = function () {
        window.location.href = `http://localhost:5236/Home/single?slug=${slug}`;
    };

    container.appendChild(popup);

    setTimeout(function () {
        popup.style.opacity = '0';
        setTimeout(function () {
            container.removeChild(popup);
        }, 300);
    }, 5000); // Hide popup after 5 seconds
}

function fetchNotifications(userId) {
    $.ajax({
        url: "http://localhost:5233/api/Products/noti/" + userId,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem('token')
        },
        success: function (data) {
            data.forEach(notification => displayNotification(notification.message, notification.slug, false));
        },
        error: function (error) {
            console.error("Error fetching notifications: ", error);
        }
    });
}

// Request permission for Notifications API
if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
            console.log("Notification permission granted.");
        }
    });
}

// Function to decode JWT token
function decodeJwt(token) {
    try {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error decoding JWT token: ", error);
        return {};
    }
}
