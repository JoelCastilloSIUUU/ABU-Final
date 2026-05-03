import React from 'react';

function ModuleCard({ item, href, userNombre, userid, buildUserQuery }) {

  // 👉 fallback por si NO se pasa la función
  const query = buildUserQuery
    ? buildUserQuery(userNombre, userid)
    : `nombre=${encodeURIComponent(userNombre || 'Usuario')}&userid=${encodeURIComponent(userid || '')}`;

  const finalHref = href || `/${item.slug}?${query}`;

  return (
    <div className="col-12 col-lg-6 p-0 mb-3">
      <a className="text-decoration-none" href={finalHref}>
        <div className="card border-0 shadow-sm module-card principal-module-card">
          <div className="p-3 d-flex align-items-center module-card-body">
            
            <div
              className="rounded-4 d-flex justify-content-center align-items-center me-3 module-icon principal-icon"
              style={{ backgroundColor: item.color }}
            >
              <i className={`bi ${item.icono}`} />
            </div>

            <div className="text-start">
              <h4 className="fw-bold mb-2 text-dark">{item.nombre}</h4>
              <p className="text-muted m-0">{item.desc}</p>
            </div>

          </div>
        </div>
      </a>
    </div>
  );
}

export default ModuleCard;