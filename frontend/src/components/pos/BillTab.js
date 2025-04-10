import { Tabs, Tab } from 'react-bootstrap';

function BillTab({ billNumber }) {
  return (
    <Tabs defaultActiveKey={`#${billNumber}`} id="bill-tab">
      <Tab eventKey={`#${billNumber}`} title={`#${billNumber}`}>
      </Tab>
    </Tabs>
  );
}

export default BillTab;
