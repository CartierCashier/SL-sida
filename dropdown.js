document.addEventListener("DOMContentLoaded", function () {
    initSearchField('fromStation', 'fromDropdown');
    initSearchField('toStation', 'toDropdown');
    initSearchField('avgångarFrom', 'avgångarDropdown');

    const avgångarInput = document.getElementById('avgångarFrom');
    const avgångarDropdown = document.createElement('ul');
    avgångarDropdown.className = 'dropdown avgångar-dropdown';
    avgångarInput.parentElement.appendChild(avgångarDropdown);
  });
  
  function initSearchField(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.querySelector(`#${dropdownId}`);
  
    input.addEventListener('input', debounce((e) => {
      fetchStations(e.target.value, dropdown);
    }, 300));
}