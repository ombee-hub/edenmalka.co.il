// Eden Malka — contact form. Validates in Hebrew, then sends the details as a ready-made WhatsApp or email message.
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var PHONE = '972506845666', MAIL = 'edenmalka230@gmail.com';
  var sendBtn = form.querySelector('.send-btn');
  var success = form.querySelector('.form-success');

  var MSG = {
    name: 'נא למלא שם מלא',
    phone: 'נא למלא מספר טלפון תקין',
    email: 'כתובת הדוא"ל אינה תקינה',
    service: 'נא לבחור במה אפשר לעזור'
  };

  function setError(input, id, text) {
    var el = document.getElementById(id);
    el.textContent = text || '';
    if (input) input.setAttribute('aria-invalid', text ? 'true' : 'false');
    return !text;
  }

  function validate() {
    var name = form.name, phone = form.phone, email = form.email;
    var ok = true, first = null;
    function check(input, id, bad) {
      var good = setError(input, id, bad);
      if (!good && !first) first = input;
      ok = ok && good;
    }
    check(name, 'e-name', name.value.trim().length < 2 ? MSG.name : '');
    check(phone, 'e-phone', !phone.value.trim() || !phone.checkValidity() ? MSG.phone : '');
    check(email, 'e-email', email.value.trim() && !email.checkValidity() ? MSG.email : '');
    var service = form.querySelector('input[name="service"]:checked');
    var radios = form.querySelectorAll('input[name="service"]');
    var serviceOk = setError(null, 'e-service', service ? '' : MSG.service);
    radios.forEach(function (r) { r.setAttribute('aria-invalid', serviceOk ? 'false' : 'true'); });
    if (!serviceOk && !first) first = radios[0];
    ok = ok && serviceOk;
    if (first) first.focus();
    return ok;
  }

  // Clear a field's error as soon as it is corrected
  form.addEventListener('input', function (e) {
    var t = e.target;
    if (t.getAttribute('aria-invalid') !== 'true') return;
    if (t.name === 'service') { setError(null, 'e-service', ''); form.querySelectorAll('input[name="service"]').forEach(function (r) { r.setAttribute('aria-invalid', 'false'); }); }
    else if (t.checkValidity() && t.value.trim()) setError(t, 'e-' + t.name, '');
  });

  function message() {
    var service = form.querySelector('input[name="service"]:checked');
    var lines = [
      'היי עדן, הגעתי מהאתר 👋',
      'שם: ' + form.name.value.trim(),
      'טלפון: ' + form.phone.value.trim()
    ];
    if (form.email.value.trim()) lines.push('דוא"ל: ' + form.email.value.trim());
    lines.push('נושא: ' + service.value);
    if (form.message.value.trim()) lines.push('', form.message.value.trim());
    return lines.join('\n');
  }

  function done() {
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    var url = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(message());
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-pause');
    // Open the tab right away (inside the click) so popup blockers allow it, then let the plane fly
    window.open(url, '_blank', 'noopener');
    if (reduce) { done(); return; }
    sendBtn.classList.remove('flying');
    void sendBtn.offsetWidth;
    sendBtn.classList.add('flying');
    setTimeout(function () { sendBtn.classList.remove('flying'); done(); }, 1400);
  });

  form.querySelector('.mail-btn').addEventListener('click', function () {
    if (!validate()) return;
    var service = form.querySelector('input[name="service"]:checked').value;
    location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('פנייה מהאתר – ' + service) + '&body=' + encodeURIComponent(message());
    done();
  });
})();
