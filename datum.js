document.querySelectorAll('input[name="när"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const datetimeContainer = document.querySelector('.datum-container');
      if (radio.id === 'ankomsttid' || radio.id === 'avgång') {
        datetimeContainer.style.display = 'block';
      } else {
        datetimeContainer.style.display = 'none';
      }
    });
});