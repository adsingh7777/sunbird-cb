let appointmentPayload = {
  service: "Service",
  name: "",
  email: "",
  phone: "",
  vehicleName: "",
  kmDriven: "",
  location: "",
  description: "",
  attachmentData: "",
};

let contactPayload = {
  name: "",
  email: "",
  phone: "",
  description: "",
};

let enableSubmit = false;

window.onRecaptchaSuccess = () => {
  console.log("onRecaptchaSuccess");
  enableSubmit = true;
};

window.onRecaptchaResponseExpiry = () => {
  console.log("onRecaptchaResponseExpiry");
  enableSubmit = false;
};

window.onRecaptchaError = () => {
  console.log("onRecaptchaError");
  enableSubmit = false;
};

const uploadFile = async () => {
  let fileData = document.getElementById("customFileLang").files[0];
  let formData = new FormData();

  formData.append("file", fileData);

  await fetch("/fileUpload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      appointmentPayload.attachmentData = {
        filename: data.message.filename,
        path: data.message.path,
        cid: data.message.originalname,
      };
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const onAppointmenFormChanges = (e) => {
  e.preventDefault();

  switch (e.target.id) {
    case "appointmentName":
      appointmentPayload.name = e.target.value;
      break;
    case "appointmentEmail":
      appointmentPayload.email = e.target.value;
      break;
    case "appointmentPhone":
      appointmentPayload.phone = e.target.value;
      break;
    case "appointmentVName":
      appointmentPayload.vehicleName = e.target.value;
      break;
    case "appointmentKMDriven":
      appointmentPayload.kmDriven = e.target.value;
      break;
    case "appointmentLocation":
      appointmentPayload.location = e.target.value;
      break;
    case "ev-textarea":
      appointmentPayload.description = e.target.value;
      break;
    case "service":
      appointmentPayload.service = "Service";
      break;
    case "repair":
      appointmentPayload.service = "Repair";
      break;
    case "eu-Inspection":
      appointmentPayload.service = "EU-Inspection";
      break;
    case "diagnostics":
      appointmentPayload.service = "Diagnostics";
      break;
    case "remanufacturing":
      appointmentPayload.service = "Remanufacturing";
      break;
    case "installations":
      appointmentPayload.service = "Installations";
      break;
    default:
      return null;
  }
};

const formFieldVerifier = (data) => {
  let emptyKey =
    Object.values(data.name).length === 0 ||
    Object.values(data.email).length === 0 ||
    Object.values(data.phone).length === 0 ||
    Object.values(data.vehicleName).length === 0 ||
    Object.values(data.kmDriven).length === 0 ||
    Object.values(data.location).length === 0 ||
    Object.values(data.description).length === 0;

  return emptyKey;
};

const contactFieldVerifier = (data) => {
  let emptyKey =
    Object.values(data.name).length === 0 ||
    Object.values(data.email).length === 0 ||
    Object.values(data.phone).length === 0 ||
    Object.values(data.description).length === 0;

  return emptyKey;
};

const sendEmail = (e) => {
  e.preventDefault();

  let payload = appointmentPayload;

  payload["subject"] = `New appointment - ${appointmentPayload.name}`;

  let dataVerified = formFieldVerifier(payload);

  if (payload.attachmentData === "") {
    delete payload.attachmentData;
  }

  if (enableSubmit) {
    if (!dataVerified) {
      document.getElementById("book-status-msg").style.visibility = "visible";
      document.getElementById("book-error").style.visibility = "hidden";

      fetch("/sendMail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          sendAckEmail(e);
          console.log("Success:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      document.getElementById("book-error").style.visibility = "visible";
    }
  }
};

const sendAckEmail = (e) => {
  e.preventDefault();
  let payload = {
    email: appointmentPayload.email,
    subject: `Appointment booked - ${appointmentPayload.name}`,
    thankyou: `Thank you - ${appointmentPayload.name}`,
    content:
      "We received your booking details. We are looking into your request",
  };

  fetch("/sendAckMail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("book-status-msg").style.visibility = "hidden";
      document.getElementById("book-success").style.visibility = "visible";
      setTimeout(() => {
        document.getElementById("book-success").style.visibility = "hidden";
      }, 3500);
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const sendContactAckEmail = (e) => {
  e.preventDefault();
  let payload = {
    email: contactPayload.email,
    subject: "EV Services - Received your query",
    thankyou: `Thank you for contacting us`,
    content: "We received your query. We will get back to you sooner",
  };

  fetch("/sendAckMail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("contact-status-msg").style.visibility = "hidden";
      document.getElementById("contact-book-success").style.visibility =
        "visible";
      setTimeout(() => {
        document.getElementById("contact-book-success").style.visibility =
          "hidden";
      }, 3500);
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const onContactFormChanges = (e) => {
  e.preventDefault();

  switch (e.target.id) {
    case "contactName":
      contactPayload.name = e.target.value;
      break;
    case "contactEmail":
      contactPayload.email = e.target.value;
      break;
    case "contactPhone":
      contactPayload.phone = e.target.value;
      break;
    case "contactDescription":
      contactPayload.description = e.target.value;
      break;
    default:
      return null;
  }
};

const sendContactEmail = (e) => {
  e.preventDefault();

  let payload = contactPayload;

  payload["subject"] = `New query - ${contactPayload.name}`;

  let dataVerified = contactFieldVerifier(payload);

  if (enableSubmit) {
    if (!dataVerified) {
      document.getElementById("contact-status-msg").style.visibility = "visible";
      document.getElementById("contact-error").style.visibility = "hidden";
      fetch("/sendContactMail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          sendContactAckEmail(e);
          console.log("Success:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      document.getElementById("contact-error").style.visibility = "visible";
    }
  }
};
