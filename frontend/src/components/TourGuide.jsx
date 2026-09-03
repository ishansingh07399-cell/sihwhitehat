import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
export default function useTourGuide() {
  useEffect(() => {
    window.startTour = () => {
      const driverObj = driver({
        showProgress: true,
        steps: [
          {
            element: '#tour-dashboard-kpis',
            popover: {
              title: 'Command Center',
              description: 'This is the high-level overview. The system instantly summarizes entities, connections, and critical alerts from all ingested data.',
              side: 'bottom', align: 'start'
            }
          },
          {
            element: '#tour-activity-feed',
            popover: {
              title: 'Real-time Processing',
              description: 'As data is ingested (FIRs, CDRs, Bank ledgers), the NLP and GNN models process it here in real-time.',
              side: 'left', align: 'start'
            }
          },
          {
            element: '#tour-sidebar-ingest',
            popover: {
              title: 'Multi-Modal Ingestion',
              description: 'Investigators can upload unstructured text (like FIRs) and structured CSVs (Call Records, Financial Ledgers) here.',
              side: 'right', align: 'start'
            }
          },
          {
            element: '#tour-sidebar-network',
            popover: {
              title: 'Interactive Network Graph',
              description: 'The core visualization. Explore nodes, filter by entity type, and see GNN-predicted hidden links highlighted in red.',
              side: 'right', align: 'start'
            }
          },
          {
            element: '#tour-chat-assistant',
            popover: {
              title: 'AI Investigator',
              description: 'Need quick answers? Ask the LLM agent natural language questions about the graph data and suspects.',
              side: 'left', align: 'end'
            }
          },
          {
            popover: {
              title: 'Tour Complete',
              description: 'Feel free to explore the interactive graph, dark web module, and export court-ready PDF dossiers!',
            }
          }
        ]
      });
      driverObj.drive();
    };
  }, []);
  return null;
}
