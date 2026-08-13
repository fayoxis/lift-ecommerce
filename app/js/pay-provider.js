(function () {
  "use strict";
  var currentScript = document.currentScript;
  var METHOD = (currentScript && currentScript.getAttribute("data-method")) || "Mobile Money";

  document.addEventListener("DOMContentLoaded", init);
  // In case DOMContentLoaded already fired (unlikely, script isn't deferred but keep safe)
  if (document.readyState !== "loading") init();

  var inited = false;
  function init() {
    if (inited) return;
    inited = true;

    LIFT.mountHeader("products");
    LIFT.mountFooter();

    var t = LIFT.cart.totals();
    var amountEl = document.getElementById("amountValue");
    if (!t.lines.length) {
      LIFT.toast("Your cart is empty — add products before paying");
      setTimeout(function () { window.location.href = "cart.html"; }, 900);
      return;
    }
    amountEl.textContent = LIFT.fcfa(t.total);

    var form = document.getElementById("payForm");
    var phone = document.getElementById("phoneInput");
    var pin = document.getElementById("pinInput");
    var pinConfirm = document.getElementById("pinConfirm");
    var phoneError = document.getElementById("phoneError");
    var pinError = document.getElementById("pinError");
    var payBtn = document.getElementById("payBtn");

    phone.addEventListener("input", function () {
      phone.value = phone.value.replace(/[^0-9]/g, "").slice(0, 9);
    });
    [pin, pinConfirm].forEach(function (el) {
      el.addEventListener("input", function () { el.value = el.value.replace(/[^0-9]/g, "").slice(0, 6); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      phoneError.textContent = "";
      pinError.textContent = "";
      var ok = true;

      if (phone.value.length < 9) {
        phoneError.textContent = "Enter a valid 9-digit mobile money number.";
        ok = false;
      }
      if (pin.value.length < 4) {
        pinError.textContent = "Pincode must be at least 4 digits.";
        ok = false;
      } else if (pin.value !== pinConfirm.value) {
        pinError.textContent = "Pincodes don't match.";
        ok = false;
      }
      if (!ok) return;

      if (!LIFT.user.get()) {
        LIFT.toast("Please log in to complete your order");
        setTimeout(function () { window.location.href = LIFT.loginUrl("#login"); }, 900);
        return;
      }

      payBtn.disabled = true;
      payBtn.textContent = "Processing…";

      setTimeout(function () {
        var order = LIFT.orders.create({
          method: METHOD,
          phone: "+237 " + phone.value
        });
        window.location.href = "order-success.html?order=" + encodeURIComponent(order.id);
      }, 1400);
    });
  }
})();
