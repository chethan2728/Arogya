const data = new FormData();
data.append("name", "franklin");
data.append("email", "franklin@demo.com");
data.append("password", "12345678");
data.append("degree", "MBBS");
data.append("experience", "4 years");
data.append("about", "something");
data.append("fees", "40");
data.append("address", "\"{\\\"line1\\\": \\\"17th Cross\\\", \\\"line2\\\": \\\"Richmond\\\"}\"");
data.append("speciality", "General Physician");
data.append("", "");

const xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === this.DONE) {
    console.log(this.responseText);
  }
});

xhr.open("POST", "http://localhost:4000/api/admin/add-doctor");

xhr.send(data);