import {
  CButton,
  CCard,
  CCardBody,
  CCardTitle,
  CContainer,
  CNavbar,
  CNavbarBrand,
} from '@coreui/react'

function App() {
  return (
    <>
      <CNavbar colorScheme="dark" className="bg-dark">
        <CContainer fluid>
          <CNavbarBrand href="#">MavaziHub</CNavbarBrand>
        </CContainer>
      </CNavbar>

      <CContainer className="py-5">
        <CCard>
          <CCardBody>
            <CCardTitle>MavaziHub Frontend</CCardTitle>
            <p>React + CoreUI Skeleton wurde erfolgreich eingerichtet.</p>
            <CButton color="primary">Test Button</CButton>
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  )
}

export default App