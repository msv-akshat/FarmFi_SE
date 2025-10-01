import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import heroImg from '../assets/navlogo.png';

const Home = () => {
  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh' }}
    >
      <Row className="justify-content-center w-100">
        <Col xs={12} md={10} lg={8}>
          <Card
            className="shadow-lg border-0 rounded-5 p-5 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Card.Body>
              <img
                src={heroImg}
                alt="Udhyan Setu"
                style={{
                  width: 160,
                  marginBottom: 30,
                  borderRadius: '20px',
                  boxShadow: '0 8px 30px rgba(33,136,56,0.25)',
                  transform: 'rotate(-2deg)',
                }}
              />
              <Card.Title
                as="h1"
                className="mb-3"
                style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#218838', fontSize: '3rem' }}
              >
                Empowering <span style={{ color: '#0d6efd' }}>Farmers</span>
              </Card.Title>
              <Card.Text className="mb-4" style={{ fontSize: '1.3rem', color: '#555' }}>
                Udhyan Setu is your cloud-native agriculture platform.<br />
                Insights, analytics, and connectivity at your fingertips.
              </Card.Text>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Button
                  href="/login"
                  style={{
                    background: 'linear-gradient(90deg, #218838, #45c16a)',
                    border: 'none',
                    fontWeight: 600,
                    padding: '0.6rem 1.5rem',
                  }}
                  className="shadow-sm"
                >
                  Get Started
                </Button>
                <Button
                  variant="outline-primary"
                  className="fw-bold shadow-sm"
                  style={{ padding: '0.6rem 1.5rem' }}
                >
                  Learn More
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
