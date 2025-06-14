import React from "react";
import Pagination from "react-bootstrap/Pagination";
import { Row, Col } from "react-bootstrap";
import "../../styles/Paginacion.css"; 

const Paginacion = ({
  itemsPerPage,
  totalItems,
  currentPage,
  setCurrentPage,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginationItems = [];
  const maxPagesToShow = 3;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let page = startPage; page <= endPage; page++) {
    paginationItems.push(
      <Pagination.Item
        key={page}
        active={page === currentPage}
        onClick={() => handlePageChange(page)}
      >
        {page}
      </Pagination.Item>
    );
  }

  return (
    <Row className="mt-3">
      <Col className="d-flex justify-content-center">
        <Pagination className="custom-pagination">
          <Pagination.First
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {startPage > 1 && <Pagination.Ellipsis disabled />}
          {paginationItems}
          {endPage < totalPages && <Pagination.Ellipsis disabled />}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </Col>
    </Row>
  );
};

export default Paginacion;
