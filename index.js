class MyFormController {

  constructor() {
    this.init();
    this.submit = this.submit.bind(this);
  }

  init() {
    this.bindElements();
    this.bindEvents();
  }

  bindElements() {
    this.fields = {
      'fio': $('#fio'),
      'email': $('#email'),
      'phone': $('#phone'),
    }

    this.form = $('#myForm');
    this.button = $('#submitButton');
    this.resultOutput = $('#resultContainer');
  }

  bindEvents() {
    const submitCallback = this.submit;

    this.form.submit(event => this.submit(event));

    for (let key in this.fields) {
      this.fields[key].focus(e => this.fields[key].removeClass('error'));
      this.fields[key].on('keydown', e => this.button.removeAttr('disabled'));
    }

    $('#resultradio input').focus(e => this.button.removeAttr('disabled'));
  }

  getValidationPatterns() {
    return {
      fio: "^[a-zA-Zа-яА-ЯёЁ]+\\s[a-zA-Zа-яА-ЯёЁ]+\\s[a-zA-Zа-яА-Я]+$",
      phone: "^\\+7\\([0-9]{3}\\)[0-9]{3}\\-[0-9]{2}\\-[0-9]{2}$",
      email: "^[a-zA-Z0-9.!#$%&'*+\-/=?^_`{|}~]+@(ya\.ru|yandex\.ru|yandex\.ua|yandex\.by|yandex\.kz|yandex\.com)$",
    }
  }

  getPhoneDigitsSumLimit() {
    return 30;
  }

  validate() {
    const formData = this.getData();

    let validationResult = {
      isValid: true,
      errorFields: []
    }

    Object.keys(formData).forEach(key => {
      if (!formData.hasOwnProperty(key)) {
        return;
      }
      const tester = new RegExp(this.getValidationPatterns()[key]);

      if (!formData[key].length || !tester.test(formData[key])) {
        validationResult.isValid = false;
        validationResult.errorFields.push(key);
        return;
      }

      if (key === "phone") {
        const digitString = formData[key].replace(/[^\d]/g, '');
        const sum = Array.from(digitString).reduce((a, b) => parseInt(a, 10) + parseInt(b, 10));

        if (sum > this.getPhoneDigitsSumLimit()) {
          validationResult.isValid = false;
          validationResult.errorFields.push(key);
          return;
        }
      }
    });

    if (!validationResult.isValid) {
      this.highlightFields(validationResult.errorFields);
    }

    return validationResult;
  }

  submit(e) {
    e && e.preventDefault();
    this.resultOutput.html('');

    const validationResult = this.validate();
    if (validationResult.isValid) {
      this.button.attr('disabled', true);
      this.resultOutput.removeClass('success');
      this.resultOutput.removeClass('progress');
      this.resultOutput.removeClass('error');
      this.sendRequest();
    }
    return;
  }

  sendRequest(){
    const payload = this.getData();
    let url;
    switch ($('#resultradio input:checked').val()){
      case 'success':
        url = './responses/success.json';
        break;
      case 'error':
        url = './responses/error.json';
        break;
      case 'progress':
        url = './responses/progress.json';
        break;
    }

    console.log(url);

    let request = fetch(url);
    request 
    .then(res => res.json())
    .then(res => this.handleResponse(res));
  }

  handleResponse(res){
    switch (res.status){
      case 'success':
        this.resultOutput.html('Success');
        this.resultOutput.addClass('success');
        break;
      case 'error':
        this.resultOutput.html(res.reason);
        this.resultOutput.addClass('error');
        break;
      case 'progress':
        this.resultOutput.html(`Processing... Next attempt in ${res.timeout}ms`);
        this.resultOutput.addClass('progress');
        return window.setTimeout(this.sendRequest.bind(this), res.timeout);
        break;
    }

    return;
  }

  getData() {
    return {
      fio: this.fields.fio.val() === null ? '' : this.fields.fio.val(),
      phone: this.fields.phone.val() === null ? '' : this.fields.phone.val(),
      email: this.fields.email.val() === null ? '' : this.fields.email.val(),
    }
  }

  setData(data) {
    this.fields.fio.val(data.fio);
    this.fields.phone.val(data.phone);
    this.fields.email.val(data.email);
    return;
  }

  highlightFields(fields) {
    if (fields.length) {
      fields.forEach(key => {
        this.fields[key].addClass('error');
      })
    }
  }
}

let MyForm = new MyFormController();