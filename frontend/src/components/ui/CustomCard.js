import React from 'react';

const CustomCard = ({ children }) => {
    const styles = {
        card: {
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            backgroundColor: '#fff',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            maxWidth: '300px',
            margin: '10px',
        },
        header: {
            backgroundColor: '#f8f9fa',
            padding: '12px 16px',
            borderBottom: '1px solid #ddd',
            fontWeight: 'bold',
            fontSize: '1.1rem',
        },
        body: {
            padding: '16px',
        },
        footer: {
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #ddd',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#555',
        },
    };

    return <div style={styles.card}>{children}</div>;
};

const Header = ({ children }) => {
    const styles = {
        header: {
            backgroundColor: '#f8f9fa',
            padding: '12px 16px',
            borderBottom: '1px solid #ddd',
            fontWeight: 'bold',
            fontSize: '1.1rem',
        },
    };
    return <div style={styles.header}>{children}</div>;
};

const Body = ({ children }) => {
    const styles = {
        body: {
            padding: '16px',
        },
    };
    return <div style={styles.body}>{children}</div>;
};

const Footer = ({ children }) => {
    const styles = {
        footer: {
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #ddd',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#555',
        },
    };
    return <div style={styles.footer}>{children}</div>;
};

// Attach subcomponents to CustomCard
CustomCard.Header = Header;
CustomCard.Body = Body;
CustomCard.Footer = Footer;

export default CustomCard;