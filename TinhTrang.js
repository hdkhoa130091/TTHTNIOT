// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxShyBby_F5ELOPHbQuT7gyhuuFBg4Tnw",
    authDomain: "tt-iot-34308.firebaseapp.com",
    databaseURL: "https://tt-iot-34308-default-rtdb.firebaseio.com",
    projectId: "tt-iot-34308",
    storageBucket: "tt-iot-34308.appspot.com",
    messagingSenderId: "1037346484738",
    appId: "1:1037346484738:web:084ca5c7eb33f85d88ed1b",
    measurementId: "G-FM3BGBCXQZ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = firebase.database();

/* BIEU DO */
// Hàm cập nhật biểu đồ
function updateChart(chart, value) {
    chart.data.datasets[0].data.push(value);
    if (chart.data.datasets[0].data.length > 8) {
        chart.data.datasets[0].data.shift(); // Xóa phần tử cũ để duy trì dữ liệu mới
    }
    chart.update();
}

// Liên kết và cập nhật dữ liệu từ Firebase cho Họ Tên và Tuổi
const nameElement = document.getElementById("name");
database.ref("/TT_IOT/HoTen").on("value", function(snapshot) {
    const nameValue = snapshot.val();
    nameElement.innerHTML = nameValue;
});

const ageElement = document.getElementById("age");
database.ref("/TT_IOT/Tuoi").on("value", function(snapshot) {
    const ageValue = snapshot.val();
    ageElement.innerHTML = ageValue + " tuổi";
});

// Lấy dữ liệu giới tính từ Firebase
const genderSelect = document.getElementById("gender-select");
const genderDisplayElement = document.getElementById("gender-display");

// Lắng nghe sự thay đổi dữ liệu từ Firebase
database.ref("/TT_IOT/GioiTinh").on("value", function(snapshot) {
    const genderValue = snapshot.val();
    genderSelect.value = genderValue; // Cập nhật giá trị select khi dữ liệu Firebase thay đổi
    genderDisplayElement.textContent = genderValue === 1 ? "Nam" : "Nữ"; // Hiển thị "Nam" hoặc "Nữ"
});

// Lắng nghe sự kiện thay đổi cho thẻ select
genderSelect.addEventListener("change", function() {
    const genderValue = this.value; // Lấy giá trị giới tính đã chọn
    // Ghi dữ liệu vào Firebase với giá trị tương ứng
    database.ref("/TT_IOT/GioiTinh").set(genderValue); // Cập nhật giá trị giới tính vào Firebase
});

// Liên kết và cập nhật dữ liệu từ Firebase cho Đường huyết
const bloodSugarValueElement = document.getElementById("blood-sugar-value");
const bloodSugarAlertIcon = document.getElementById("blood-sugar-alert-icon");
const bloodSugarAlertText = document.getElementById("blood-sugar-alert-text");

const bloodSugarChart = new Chart(document.getElementById('bloodSugarChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'], // Tối đa 8 lần đo
        datasets: [{
            label: 'Đường huyết (mmHg)',
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                max: 100 , // Chiều cao tối đa là 210
                ticks: {
                    stepSize: 10 // Cách nhau mỗi 10
                },
                title: {
                    display: true,
                    text: 'mmHg' // Tiêu đề trục tung
                }
            },
            x: {
                ticks: {
                    max: 8 // Tối đa 8 lần đo
                },
                title: {
                    display: true,
                    text: 'Số lần đo' // Tiêu đề trục hoành
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: 'Biểu đồ Đường huyết' // Tiêu đề của biểu đồ
            }
        }
    }
});
    // Lấy dữ liệu ban đầu từ Firebase để cập nhật biểu đồ Đường huyết
    function updateBloodSugarHistory(value) {
        database.ref("/TT_IOT/Duonghuyet").once("value", function(snapshot) {
            let history = snapshot.val() || []; // Lấy lịch sử hoặc khởi tạo mảng mới nếu chưa có dữ liệu
            history.push(value); // Thêm giá trị mới vào lịch sử
        
            if (history.length > 8) {
                history.shift(); // Xóa phần tử cũ để chỉ giữ 8 lần đo gần nhất
            
            }

        // Lưu lịch sử cập nhật trở lại Firebase
            database.ref("/TT_IOT/LichSu/Duonghuyet").set(history);
        });
}

database.ref("/TT_IOT/Duonghuyet").on("value", function(snapshot) {
    const bloodSugarValue = snapshot.val();
    bloodSugarValueElement.innerHTML = bloodSugarValue + ' mmHg';

    if (bloodSugarValue >= 50 && bloodSugarValue < 115) {
        bloodSugarAlertIcon.src = "blood_sugar_excellent.png";
        bloodSugarAlertText.innerHTML = "Excellent";
    } else if (bloodSugarValue >= 115 && bloodSugarValue < 180) {
        bloodSugarAlertIcon.src = "blood_sugar_good.png";
        bloodSugarAlertText.innerHTML = "Good";
    } else if (bloodSugarValue >= 180 ) {
        bloodSugarAlertIcon.src = "blood_sugar_action_suggested.png";
        bloodSugarAlertText.innerHTML = "Action suggested";
    } else {
        bloodSugarAlertIcon.src = "invalid_values.png";
        bloodSugarAlertText.innerHTML = "Invalid";
    }
    updateChart(bloodSugarChart, bloodSugarValue); // Cập nhật biểu đồ đường huyết
    updateBloodSugarHistory(bloodSugarValue);
});

// Liên kết và cập nhật dữ liệu cho Nhịp tim
const heartRateValueElement = document.getElementById("heart-rate-value");
const heartRateChart = new Chart(document.getElementById('heartRateChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'], // Tối đa 13 phút
        datasets: [{
            label: 'Nhịp tim (bpm)',
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                max: 100, // Tối đa là 100 bpm
                ticks: {
                    stepSize: 10 // Cách nhau mỗi 10 bpm
                },
                title: {
                    display: true,
                    text: 'bpm' // Tiêu đề trục tung
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Phút' // Tiêu đề trục hoành
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: 'Biểu đồ Nhịp tim' // Tiêu đề của biểu đồ
            }
        }
    }
});
// Lắng nghe sự kiện thay đổi từ Firebase cho Nhịp tim
database.ref("/TT_IOT/NhipTim").on("value", function(snapshot) {
    const heartRateValue = snapshot.val();
    console.log("Giá trị nhịp tim từ Firebase:", heartRateValue); // Kiểm tra dữ liệu
    if (heartRateValue !== null && heartRateValue !== undefined) {
        heartRateValueElement.innerHTML = heartRateValue + ' bpm';
        updateChart(heartRateChart, heartRateValue); // Cập nhật biểu đồ nhịp tim
     
    } else {
        heartRateValueElement.innerHTML = 'Không có dữ liệu'; // Thông báo khi không có dữ liệu




    }
});
// ** SpO2 **
const spO2ValueElement = document.getElementById("spO2-value");
const spO2Chart = new Chart(document.getElementById('spO2Chart').getContext('2d'), {
    type: 'doughnut',
    data: {
        labels: ['SpO2', 'Thiếu hụt'], // Nhãn cho biểu đồ
        datasets: [{
            label: 'SpO2',
            data: [0, 100], // Khởi tạo với dữ liệu ban đầu (sẽ được cập nhật từ Firebase)
            backgroundColor: ['#4CAF50', '#FF5252'],
            borderColor: ['#FFFFFF', '#FFFFFF'],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        cutout: '60%',
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    }
});
// Lắng nghe sự kiện thay đổi từ Firebase cho SpO2
database.ref("/TT_IOT/SPO2").on("value", function(snapshot) {
    const spO2Value = snapshot.val();
    spO2ValueElement.innerHTML = spO2Value + '%';

    // Cập nhật dữ liệu cho biểu đồ SpO2
    const deficiencyValue = 100 - spO2Value; // Tính phần thiếu hụt
    spO2Chart.data.datasets[0].data = [spO2Value, deficiencyValue]; // Cập nhật giá trị SpO2 và thiếu hụt
    spO2Chart.update(); // Cập nhật biểu đồ
});


const heartRateAlertIcon = document.getElementById("heart-rate-alert-icon");
const heartRateAlertText = document.getElementById("heart-rate-alert-text");

// Lấy giá trị tuổi và giới tính từ Firebase
database.ref("/TT_IOT/Tuoi").on("value", function(snapshot) {
    const ageValue = snapshot.val();
    database.ref("/TT_IOT/GioiTinh").on("value", function(snapshot) {
        const genderValue = snapshot.val(); // 1: Nam, 0: Nữ

        // Lấy dữ liệu nhịp tim từ Firebase
        database.ref("/TT_IOT/NhipTim").on("value", function(snapshot) {
            const heartRateValue = snapshot.val();
            heartRateValueElement.innerHTML = heartRateValue + ' bpm';

            let alertIcon = "";
            let alertText = "";

            // Phân loại nhịp tim theo tuổi và giới tính
            if (genderValue === "1") { // Nam
                if (ageValue >= 18 && ageValue <= 25) {
                    if (heartRateValue >= 49 && heartRateValue <= 55) {
                        alertIcon = "athlete_male.png";
                        alertText = "Athlete";
                    } else if (heartRateValue >= 56 && heartRateValue <= 61) {
                        alertIcon = "excellent_male.png";
                        alertText = "Excellent";
                    } else if (heartRateValue >= 62 && heartRateValue <= 65) {
                        alertIcon = "great_male.png";
                        alertText = "Great";
                    } else if (heartRateValue >= 66 && heartRateValue <= 69) {
                        alertIcon = "good_male.png";
                        alertText = "Good";
                    } else if (heartRateValue >= 70 && heartRateValue <= 73) {
                        alertIcon = "average_male.png";
                        alertText = "Average";
                    } else if (heartRateValue >= 74 && heartRateValue <= 81) {
                        alertIcon = "below_average_male.png";
                        alertText = "Below Average";
                    } else {
                        alertIcon = "poor_male.png";
                        alertText = "Poor";
                    }
                } else if (ageValue >= 26 && ageValue <= 35) {
                    if (heartRateValue >= 49 && heartRateValue <= 54) {
                        alertIcon = "athlete_male.png";
                        alertText = "Athlete";
                    } else if (heartRateValue >= 56 && heartRateValue <= 61) {
                        alertIcon = "excellent_male.png";
                        alertText = "Excellent";
                    } else if (heartRateValue >= 62 && heartRateValue <= 65) {
                        alertIcon = "great_male.png";
                        alertText = "Great";
                    } else if (heartRateValue >= 66 && heartRateValue <= 70) {
                        alertIcon = "good_male.png";
                        alertText = "Good";
                    } else if (heartRateValue >= 71 && heartRateValue <= 74) {
                        alertIcon = "average_male.png";
                        alertText = "Average";
                    } else if (heartRateValue >= 75 && heartRateValue <= 81) {
                        alertIcon = "below_average_male.png";
                        alertText = "Below Average";
                    } else {
                        alertIcon = "poor_male.png";
                        alertText = "Poor";
                    }
                }
                // Tiếp tục tương tự cho các nhóm tuổi khác...
            } else { // Nữ
                if (ageValue >= 18 && ageValue <= 25) {
                    if (heartRateValue >= 54 && heartRateValue <= 60) {
                        alertIcon = "athlete_female.png";
                        alertText = "Athlete";
                    } else if (heartRateValue >= 61 && heartRateValue <= 65) {
                        alertIcon = "excellent_female.png";
                        alertText = "Excellent";
                    } else if (heartRateValue >= 66 && heartRateValue <= 69) {
                        alertIcon = "great_female.png";
                        alertText = "Great";
                    } else if (heartRateValue >= 70 && heartRateValue <= 73) {
                        alertIcon = "good_female.png";
                        alertText = "Good";
                    } else if (heartRateValue >= 74 && heartRateValue <= 78) {
                        alertIcon = "average_female.png";
                        alertText = "Average";
                    } else if (heartRateValue >= 79 && heartRateValue <= 84) {
                        alertIcon = "below_average_female.png";
                        alertText = "Below Average";
                    } else {
                        alertIcon = "poor_female.png";
                        alertText = "Poor";
                    }
                }
                // Tiếp tục cho các nhóm tuổi khác của nữ...
            }

            heartRateAlertIcon.src = alertIcon;
            heartRateAlertText.innerHTML = alertText;
        });
    });
});
// Liên kết và cập nhật dữ liệu từ Firebase cho Nhiệt độ cơ thể
const bodyTempValueElement = document.getElementById("body-temp-value");
const bodyTempAlertIcon = document.getElementById("body-temp-alert-icon");
const bodyTempAlertText = document.getElementById("body-temp-alert-text");

database.ref("/TT_IOT/Nhietdo").on("value", function(snapshot) {
    const bodyTempValue = snapshot.val();
    bodyTempValueElement.innerHTML = bodyTempValue + " °C";

    // Kiểm tra và hiển thị cảnh báo cho các mức nhiệt độ
    if (bodyTempValue >= 36.5 && bodyTempValue <= 37.5) {
        bodyTempAlertIcon.src = "thannhietbinhthuong.jpg";
        bodyTempAlertText.innerHTML = "Normal";
    } else if (bodyTempValue > 37.5 && bodyTempValue <= 38.5) {
        bodyTempAlertIcon.src = "sotnhe.png";
        bodyTempAlertText.innerHTML = "Fever";
    } else if (bodyTempValue > 38.5) {
        bodyTempAlertIcon.src = "sotnang.png";
        bodyTempAlertText.innerHTML = "High Fever";
    } else if (bodyTempValue < 36.5) {
        bodyTempAlertIcon.src = "hathannhiet.jpg";
        bodyTempAlertText.innerHTML = "Hypothermia";
    } else {
        bodyTempAlertIcon.src = "invalid_values.png";
        bodyTempAlertText.innerHTML = "Invalid values";
    }
});


const SPO2ValueElement = document.getElementById("spo2-value");
const SPO2AlertIcon = document.getElementById("spo2-alert-icon");
const SPO2AlertText = document.getElementById("spo2-alert-text");

// Lắng nghe sự kiện thay đổi từ Firebase cho SpO2
database.ref("/TT_IOT/SPO2").on("value", function(snapshot) {
    const SPO2Value = snapshot.val();
    SPO2ValueElement.innerHTML = SPO2Value + '%'; // Hiển thị giá trị SpO2

    // Kiểm tra giá trị SpO2 và thay đổi ảnh, văn bản tương ứng
    if ( SPO2Value > 85 && SPO2Value <= 100) {
        SPO2AlertIcon.src = "blood_pressure_normal.png"; // Hình ảnh bình thường
        SPO2AlertText.innerHTML = "Normal";
    } else if (SPO2Value > 67 && SPO2Value <= 85) {
        SPO2AlertIcon.src = "spo2_abnormal.png"; // Hình ảnh bất thường
        SPO2AlertText.innerHTML = "Abnormal (brain may be affected)";
    } else if (SPO2Value <= 67) {
        SPO2AlertIcon.src = "spo2_cyanosis.png"; // Hình ảnh cyanosis
        SPO2AlertText.innerHTML = "Cyanosis (Bluish skin)";
    } else {
        SPO2AlertIcon.src = "invalid_values.png"; // Hình ảnh giá trị không hợp lệ
        SPO2AlertText.innerHTML = "Invalid values";
    }
    
});

// Lưu trữ dữ liệu nhịp tim vào Firebase
const saveHeartRateButton = document.getElementById("save-heart-rate");
saveHeartRateButton.addEventListener("click", function() {
    const newHeartRateValue = document.getElementById("input-heart-rate").value;
    database.ref("/TT_IOT/NhipTim").set(newHeartRateValue);
});

// Lưu trữ dữ liệu đường huyết vào Firebase
const saveBloodSugarButton = document.getElementById("save-blood-sugar");
saveBloodSugarButton.addEventListener("click", function() {
    const newBloodSugarValue = document.getElementById("input-blood-sugar").value;
    database.ref("/TT_IOT/Duonghuyet").set(newBloodSugarValue);
});
// Lưu trữ dữ liệu nhiệt độ vào Firebase
const saveBodyTempButton = document.getElementById("save-body-temp");
saveBodyTempButton.addEventListener("click", function() {
    const newBodyTempValue = document.getElementById("input-body-temp").value;
    database.ref("/TT_IOT/Nhietdo").set(newBodyTempValue);
});

// Hàm để thay đổi trạng thái hình ảnh
function toggleDeviceImage(imgElement, onImage, offImage, state) {
    console.log(`Changing image to ${state ? "On" : "Off"}`);
    imgElement.src = state ? onImage : offImage;
}

// Đèn
function led(show) {
    var pic;
    if (show == 0) {
      pic = "monitoring -off.png";
      firebase.database().ref("led").set({ ledState: false });
    } else {
      pic = "monitoring-on.png";
      firebase.database().ref("led").set({ ledState: true });
    }
    document.getElementById("bulb").src = pic;
  }

// Nhiệt độ
function temperature(show) {
    var pic;
    if (show == 0) {
        pic = "power-off.png";
        firebase.database().ref("temperature").set({ tempState: false });
    } else {
        pic = "power-on.png";
        firebase.database().ref("temperature").set({ tempState: true });
    }
    document.getElementById("temperature").src = pic;
}
  // Cảnh báo
function alert(show) {
    var pic;
    if (show == 0) {
      pic = "siren-off.png";
      firebase.database().ref("alert").set({ alertState: false });
    } else {
      pic = "siren-on.png";
      firebase.database().ref("alert").set({ alertState: true });
    }
    document.getElementById("alert").src = pic;
  }