// ROAD 1ST account passwords (web hint only; backend Auth must enforce the same minimum).
// Applies to account registration and future password-change/recovery UI.
// Do not apply to existing-account sign-in or the separate 5-digit driver PIN.
(function(root){"use strict";
  var symbols = "!@#$%^&*()_+-=[]{};'\\:\"|<>?,./" + String.fromCharCode(96) + "~";
  function valid(password){
    return typeof password==="string" && password.length>=12 &&
      /[A-Za-z]/.test(password) && /[0-9]/.test(password) &&
      Array.from(password).some(function(ch){return symbols.indexOf(ch)!==-1});
  }
  root.ROAD1ST_PASSWORD_POLICY=Object.freeze({
    minLength:12,valid:valid,
    description:"At least 12 characters, including a letter, a number and a symbol."
  });
})(typeof window==="undefined"?globalThis:window);
