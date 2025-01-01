const selectedContacts = [];

function renderResults(location) {
  const rep = CityCouncil.members.find((member) => member.district === parseInt(location.councilDistrict));
  const searchResults = document.querySelector('#search-results');
  searchResults.style.display = "block";
  searchResults.querySelector('.rep-photo').src = rep.photo_url;
  const set = (el, val) => searchResults.querySelector(el).innerHTML = val;
  set('.street-address',  location.address);
  set('.district',        'District ' + location.councilDistrict);
  set('.rep-name',        rep.name);
  set('.rep-email',       `<a href="mailto:${rep.email}">${rep.email}</a>`);
  set('.rep-phone',       `<a href="tel:${rep.phone.replace(/\D/g,'')}">${rep.phone}</a>`);
}

function parseContact(element) {
  const text = (s) => element.querySelector(s).childNodes[0].textContent;
  return {
    name: text('.rep-name'),
    email: text('.rep-email'),
    phone: text('.rep-phone')
  };
}
function matchContacts(a, b) {
  return a.name === b.name && a.email === b.email;
}
function selectContact(element) {
  const contact = parseContact(element);
  if (!selectedContacts.includes(contact)) {
    selectedContacts.push(contact);
  }
}
function deselectContact(element) {
  const search = selectedContacts.find(member => matchContacts(member, parseContact(element)));
  if (search) {
    selectedContacts.splice(selectedContacts.indexOf(search), 1);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const streetAddressForm = document.querySelector('#street-address-form');
  const streetAddressInput = streetAddressForm.querySelector('input[type=text]');
  if(streetAddressInput.value.length > 0) {
    searchAddress(streetAddressInput.value).then(searchCouncil).then(renderResults);
  }
  streetAddressForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if(streetAddressInput.value.length > 0) {
      searchAddress(streetAddressInput.value).then(searchCouncil).then(renderResults);
    }
  });
  const cityCouncilTable = document.querySelector('#city-council-table tbody');
  const createTableCell = (content, className) => {
    const td = document.createElement('td');
    td.innerHTML = content;
    if (className) {
      td.className = className;
    }
    return td;
  };

  CityCouncil.members.forEach(member => {
    const tableRow = document.createElement('tr');
    const append = (content, className) => tableRow.appendChild(createTableCell(content, className));
    append("<input type='checkbox' />", "checkbox");
    append(member.district, 'district');
    append(member.name, 'rep-name');
    append(member.email, 'rep-email');
    append(member.phone, 'rep-phone');
    tableRow.className = 'selectable';
    cityCouncilTable.appendChild(tableRow);
  });

  const selectableTableRows = document.querySelectorAll('tr.selectable');
  selectableTableRows.forEach(selectableRow => {
    const checkbox = selectableRow.querySelector('td.checkbox input[type=checkbox]');
    if (checkbox) {
      const toggle = () => checkbox.checked ? selectContact(selectableRow) : deselectContact(selectableRow);
      checkbox.addEventListener("click", (e) => {
        e.stopPropagation();
        toggle();
      });
      selectableRow.addEventListener("click", () => {    
        checkbox.checked = !checkbox.checked;
        toggle();
      });
    }
  });
});