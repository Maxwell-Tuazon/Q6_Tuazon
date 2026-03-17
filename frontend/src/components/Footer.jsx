import React from 'react'

function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="py-3 text-center">
      © {year} Pest & Wildlife Control
    </footer>
  )
}

export default Footer
