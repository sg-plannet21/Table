// https://github.com/accessible-components/tag-input/blob/master/build/tag-input.js
/**
 * TagInput constructor.
 *
 * @constructor
 * @param {HTMLElement} element - Container element.
 * @param {object} options - Options.
 */
/**
 * Generates an array of numbers within a specified range.
 *
 * @param {number} low - The starting number of the range (inclusive).
 * @param {number} high - The ending number of the range (exclusive).
 * @returns {number[]} An array of numbers from `low` to `high - 1`.
 *
 */
function range(low, high) {
  return Array.from({ length: high - low }, (_, i) => i + low)
}


class DataTable {
  constructor({ element, changeHandlers, data = [], columns = [], showSearch = data.length, pageSize = 3, sortColumn = { key: columns[0].key, order: "asc" } }) {
    if (!element) {
      throw new Error("Element not provided!");
    }

    this.element = element;
    this.data = data;
    this.filtered = [];
    this.paginated = [];
    this.columns = columns;
    this.currentPage = 1;
    this.pageSize = pageSize;
    this.sortColumn = sortColumn;
    this.showSearch = showSearch;
    this.changeHandlers = changeHandlers;

    this.initData();
    this.renderPage();
    this.render();
  }

  renderPage() {
    const container = document.createElement("div");
    container.classList.add("flow");
    if (this.showSearch) {
      const searchContainer = document.createElement("div");
      searchContainer.classList.add("search-container");
      const searchIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16" class="icon icon--muted">
  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>`;
      const searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.classList.add("search");
      searchInput.placeholder = "Search...";
      searchContainer.innerHTML = searchIcon;
      searchContainer.append(searchInput);
      searchInput.addEventListener("input", (event) => {
        const searchTerm = event.target.value.trim().toLowerCase();
        this.currentPage = 1;
        if (searchTerm) {
          this.filtered = this.data.filter((entry) => {
            for (let i = 0; i < this.columns.length; i++) {
              if (!this.columns[i].ignoreFiltering) {
                const key = String(entry[this.columns[i].key]).toLowerCase();
                if (key.indexOf(searchTerm) !== -1) return true;
              }
            }
          });
        } else {
          this.filtered = this.data.slice();
        }
        this.render();
      });
      container.append(searchContainer);
    }
    const tableContainer = document.createElement("div");
    tableContainer.classList.add("table-container");
    container.append(tableContainer);

    const paginationContainer = document.createElement("div");
    paginationContainer.classList.add("pagination-container");
    container.append(paginationContainer);

    this.element.append(container);
  }

  render() {
    if (this.filtered.length) {
      this.paginate();
      this.renderTable();
      this.renderPagination();
      if (this.changeHandlers) { console.log("setting handlerrs"); this.changeHandlers(); }
    } else {
      this.renderNoEntries();
      this.element.querySelector(".pagination-container").innerHTML = "";
    }
  }

  /**
   * Sort the table data and set the filtered (table source data)
   */
  initData(tableData = this.data) {
    this.data = tableData;
    this.sortData();
  }

  /**
  * Sort the data based on the sort column's key and order
  */
  sortData() {
    const key = this.sortColumn.key;
    const order = this.sortColumn.order;
    this.data.sort(function(a, b) {
      if (order === "asc")
        return (a[key] > b[key]) - (a[key] < b[key]);

      return (b[key] > a[key]) - (b[key] < a[key]);
    });
    this.filtered = this.data.slice();
  }

  /**
 * Paginates the filtered array based on the current page and page size.
 */
  paginate() {
    const startIndex = this.pageSize * (this.currentPage - 1);
    this.paginated = this.filtered.slice(startIndex, startIndex + this.pageSize);
  }

  renderTableHead() {
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    this.columns.forEach(column => {
      const th = document.createElement('th');
      th.scope = "column";
      th.textContent = column.label;
      if (!column.ignoreFiltering) {
        if (this.sortColumn.key === column.key) {
          th.dataset.sort = this.sortColumn.order;
        } else {
          th.dataset.sort = "";
        }

        th.addEventListener("click", () => {
          if (this.sortColumn.key === column.key) {
            this.sortColumn.order = this.sortColumn.order === "asc" ? "desc" : "asc";
          } else {
            this.sortColumn.key = column.key;
            this.sortColumn.order = "asc";
          }
          this.sortData();
          this.render();
        });
      }

      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    return thead;
  }

  renderTableBody() {
    // Create table body
    const tbody = document.createElement('tbody');

    this.paginated.forEach(rowData => {
      const row = document.createElement('tr');
      this.columns.forEach(column => {
        const td = document.createElement('td');
        if (column.cell) {
          td.innerHTML = column.cell(rowData);
        } else {
          td.textContent = rowData[column.key];
        }
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    return tbody;
  }

  renderTable() {
    // Create table element
    const table = document.createElement('table');
    table.classList.add("table");

    table.appendChild(this.renderTableHead());

    table.appendChild(this.renderTableBody());

    // Append table to the provided element
    const tableContainer = this.element.querySelector(".table-container");
    tableContainer.innerHTML = "";
    tableContainer.appendChild(table);
  }

  changePage(pageNum) {
    this.currentPage = pageNum;
    this.render();
  }

  renderPagination() {
    const pages = Math.ceil(this.filtered.length / this.pageSize);
    let container = this.element.querySelector(".pagination-container");
    container.innerHTML = "";

    const startItemIndex = (this.currentPage - 1) * this.pageSize + 1
    const endItemIndex = startItemIndex - 1 + this.paginated.length

    const captionSpan = document.createElement("span");
    captionSpan.innerHTML = `Showing <strong>${startItemIndex}${startItemIndex !== endItemIndex ? ` to ${endItemIndex}` : ' '}</strong> of <strong>${this.filtered.length}</strong> items.`;
    container.append(captionSpan);

    if (pages > 1) {
      const paginationRange = 2
      const ellipse = '...'

      const surroundStart = Math.max(1, this.currentPage - paginationRange)
      const surroundEnd = Math.min(pages, this.currentPage + paginationRange)

      const items = []
      items.push(
        ...(surroundStart > 2 ? [1, ellipse] : surroundStart > 1 ? [1] : [])
      )
      items.push(...range(surroundStart, surroundEnd + 1))
      items.push(
        ...(surroundEnd < pages - 1
          ? [ellipse, pages]
          : surroundEnd < pages
            ? [pages]
            : [])
      )

      const nav = document.createElement("nav");
      nav.ariaLabel = "Pagination";

      const prevBtn = document.createElement("button");
      prevBtn.textContent = "<";
      prevBtn.disabled = this.currentPage === 1;
      prevBtn.classList.add("btn", "btn--small", "btn--nav");
      prevBtn.addEventListener("click", () => { this.changePage(this.currentPage - 1); });
      nav.append(prevBtn);

      for (let i = 0; i < pages; i++) {
        const pageNumber = i + 1;
        const pageBtn = document.createElement("button");
        pageBtn.textContent = pageNumber;
        //pageBtn.disabled = this.currentPage === pageNumber;
        pageBtn.classList.add("btn", "btn--small", "btn--nav");
        if (this.currentPage === pageNumber) {
          pageBtn.classList.add("active");
          pageBtn.ariaCurrent = "page";
        }
        pageBtn.addEventListener("click", () => { this.changePage(pageNumber); });
        nav.append(pageBtn);
      }

      const nextBtn = document.createElement("button");
      nextBtn.classList.add("btn", "btn--small", "btn--nav");
      nextBtn.textContent = ">";
      nextBtn.disabled = this.currentPage === pages;
      nextBtn.addEventListener("click", () => { this.changePage(this.currentPage + 1); });
      nav.append(nextBtn);

      container.append(nav);
    }

  }

  renderNoEntries() {
    const container = this.element.querySelector(".table-container");
    const card = document.createElement("div");
    card.classList.add("card", "card--small");
    const body = document.createElement("div");
    body.classList.add("card__body");
    body.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
        class="icon">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>`
    const heading = document.createElement("h4");
    heading.textContent = "No Entries Found";
    body.append(heading);
    card.append(body);
    container.innerHTML = "";
    container.append(card);
  }

}
