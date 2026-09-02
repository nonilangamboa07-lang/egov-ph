// Update card display when form inputs change
document.addEventListener('DOMContentLoaded', function() {
    const formInputs = document.querySelectorAll('#profileForm input, #profileForm select');
    formInputs.forEach(input => {
        input.addEventListener('change', updateCardDisplay);
        input.addEventListener('input', updateCardDisplay);
    });

    // Initial QR code generation
    generateQRCode();

    // Handle expire link checkbox
    document.getElementById('expireLink').addEventListener('change', function() {
        document.getElementById('expireOption').style.display = this.checked ? 'block' : 'none';
    });
});

function updateCardDisplay() {
    const firstName = document.getElementById('firstName').value;
    const middleName = document.getElementById('middleName').value;
    const lastName = document.getElementById('lastName').value;
    const birthday = document.getElementById('birthday').value;
    const gender = document.getElementById('gender').value;
    const bloodType = document.getElementById('bloodType').value;
    const maritalStatus = document.getElementById('maritalStatus').value;
    const address = document.getElementById('address').value;
    const idNumber = document.getElementById('idNumber').value;

    // Format full name
    let fullName = firstName;
    if (middleName) fullName += ' ' + middleName;
    if (lastName) fullName += ' ' + lastName;

    // Format birthday
    let formattedBirthday = birthday;
    if (birthday) {
        const date = new Date(birthday);
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        formattedBirthday = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    }

    // Update card display
    document.getElementById('cardName').textContent = fullName;
    document.getElementById('cardBirthday').textContent = formattedBirthday;
    document.getElementById('cardGender').textContent = gender;
    document.getElementById('cardBlood').textContent = bloodType;
    document.getElementById('cardStatus').textContent = maritalStatus;
    document.getElementById('cardAddress').textContent = address;
    document.getElementById('cardID').textContent = idNumber;

    // Regenerate QR code
    generateQRCode();
}

function generateQRCode() {
    const firstName = document.getElementById('firstName').value || 'N/A';
    const lastName = document.getElementById('lastName').value || 'N/A';
    const birthday = document.getElementById('birthday').value || 'N/A';
    const idNumber = document.getElementById('idNumber').value || 'N/A';

    const qrData = `Name: ${firstName} ${lastName} | DOB: ${birthday} | ID: ${idNumber}`;

    // Clear previous QR code
    document.getElementById('qrcode').innerHTML = '';

    // Generate new QR code
    new QRCode(document.getElementById('qrcode'), {
        text: qrData,
        width: 120,
        height: 120,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

function generateShareableLink() {
    const firstName = document.getElementById('firstName').value;
    const middleName = document.getElementById('middleName').value;
    const lastName = document.getElementById('lastName').value;
    const birthday = document.getElementById('birthday').value;
    const gender = document.getElementById('gender').value;
    const bloodType = document.getElementById('bloodType').value;
    const maritalStatus = document.getElementById('maritalStatus').value;
    const address = document.getElementById('address').value;
    const idNumber = document.getElementById('idNumber').value;
    const digitalId = document.getElementById('digitalId').value;

    // Validate required fields
    if (!firstName || !lastName || !birthday || !idNumber) {
        alert('Please fill in all required fields (First Name, Last Name, Date of Birth, ID Number)');
        return;
    }

    // Build query parameters
    let params = new URLSearchParams();
    params.append('fn', firstName);
    if (middleName) params.append('mn', middleName);
    params.append('ln', lastName);
    params.append('dob', birthday);
    if (gender) params.append('gender', gender);
    if (bloodType) params.append('blood', bloodType);
    if (maritalStatus) params.append('status', maritalStatus);
    if (address) params.append('addr', address);
    params.append('id', idNumber);
    params.append('did', digitalId);
    params.append('verified', 'true');

    // Add optional parameters
    if (document.getElementById('includePhoto').checked) {
        params.append('photo', 'true');
    }
    if (document.getElementById('includeID').checked) {
        params.append('showid', 'true');
    }
    if (document.getElementById('expireLink').checked) {
        const expireDays = document.getElementById('expireDays').value;
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + parseInt(expireDays));
        params.append('expire', expireDate.toISOString().split('T')[0]);
    }

    // Generate short hash for link
    const hash = generateHash(firstName + lastName + idNumber + Date.now());
    params.append('hash', hash);

    // Create shareable link
    const baseUrl = window.location.origin + window.location.pathname.replace('profile.html', 'verify.html');
    const shareLink = baseUrl + '?' + params.toString();

    // Display result
    document.getElementById('shareLink').value = shareLink;
    document.getElementById('linkResult').style.display = 'block';

    // Scroll to result
    document.getElementById('linkResult').scrollIntoView({ behavior: 'smooth' });

    // Generate QR code for share link
    document.getElementById('shareQR').innerHTML = '';
    new QRCode(document.getElementById('shareQR'), {
        text: shareLink,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

function copyToClipboard() {
    const linkInput = document.getElementById('shareLink');
    linkInput.select();
    document.execCommand('copy');
    
    // Show confirmation
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}

function shareVia(platform) {
    const link = document.getElementById('shareLink').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const text = `Verify my eGOV.PH Digital ID: ${firstName} ${lastName}`;

    switch(platform) {
        case 'email':
            window.location.href = `mailto:?subject=eGOV.PH Digital ID Verification&body=${encodeURIComponent(text + '\n\n' + link)}`;
            break;
        case 'sms':
            window.location.href = `sms:?body=${encodeURIComponent(text + ' ' + link)}`;
            break;
        case 'whatsapp':
            window.location.href = `https://wa.me/?text=${encodeURIComponent(text + '\n' + link)}`;
            break;
    }
}

function generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 12);
}

// URL Parameter Reader for verification page
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        firstName: params.get('fn'),
        middleName: params.get('mn'),
        lastName: params.get('ln'),
        birthday: params.get('dob'),
        gender: params.get('gender'),
        bloodType: params.get('blood'),
        maritalStatus: params.get('status'),
        address: params.get('addr'),
        idNumber: params.get('id'),
        digitalId: params.get('did'),
        verified: params.get('verified'),
        photo: params.get('photo'),
        showId: params.get('showid'),
        expire: params.get('expire'),
        hash: params.get('hash')
    };
}
