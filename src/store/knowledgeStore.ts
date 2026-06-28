import { create } from 'zustand';

export type DocStatus = 'Indexed' | 'Needs Re-index' | 'Processing' | 'Failed';
export type DocType = 'pdf' | 'docx' | 'txt' | 'md' | 'csv' | 'xlsx' | 'pptx';

export interface DocumentItem {
  id: string;
  name: string;
  collection: string;
  type: DocType;
  status: DocStatus;
  chunksCount: number;
  lastUpdated: string;
  sizeBytes: number;
  owner: string;
  language: string;
  pagesCount: number;
  embeddingModel: string;
  lastIndexed: string;
  averageChunkSize: number;
  lastRetrieved: string;
  retrievalCount: number;
  activityLog: Array<{
    action: string;
    timestamp: string;
    user: string;
    description: string;
  }>;
}

interface KnowledgeState {
  documents: DocumentItem[];
  collections: { name: string; count: number }[];
  searchQuery: string;
  collectionFilter: string; // 'all' or specific collection
  typeFilter: string; // 'all' or specific type
  statusFilter: string; // 'all' or specific status
  ownerFilter: string; // 'all' or specific owner
  dateAddedFilter: string; // 'all' or specific timeframe
  selectedDocIds: string[];
  activeDetailDocId: string | null;
  detailTab: 'overview' | 'preview' | 'activity';
  
  // UI Testing states
  pageState: 'content' | 'loading' | 'error';
  setPageState: (state: 'content' | 'loading' | 'error') => void;

  // Actions
  setSearchQuery: (query: string) => void;
  setCollectionFilter: (collection: string) => void;
  setTypeFilter: (type: string) => void;
  setStatusFilter: (status: string) => void;
  setOwnerFilter: (owner: string) => void;
  setDateAddedFilter: (date: string) => void;
  toggleDocSelection: (id: string) => void;
  selectAllDocs: (ids: string[]) => void;
  clearSelection: () => void;
  addDocument: (doc: Omit<DocumentItem, 'id' | 'lastUpdated' | 'lastIndexed' | 'activityLog' | 'averageChunkSize' | 'lastRetrieved' | 'retrievalCount'>) => void;
  deleteDocuments: (ids: string[]) => void;
  reindexDocuments: (ids: string[]) => void;
  moveToCollection: (ids: string[], targetCollection: string) => void;
  addCollection: (name: string) => void;
  setActiveDetailDocId: (id: string | null) => void;
  setDetailTab: (tab: 'overview' | 'preview' | 'activity') => void;
  getFilteredDocuments: () => DocumentItem[];
}

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Marketing Strategy 2026.pdf',
    collection: 'Marketing',
    type: 'pdf',
    status: 'Indexed',
    chunksCount: 32,
    lastUpdated: '2026-06-25T14:30:00Z',
    sizeBytes: 1245000,
    owner: 'John Doe',
    language: 'English',
    pagesCount: 12,
    embeddingModel: 'text-embedding-3-small',
    lastIndexed: '2026-06-25T14:35:00Z',
    averageChunkSize: 512,
    lastRetrieved: '2026-06-28T09:12:00Z',
    retrievalCount: 145,
    activityLog: [
      { action: 'Uploaded', timestamp: '2026-06-25T14:30:00Z', user: 'John Doe', description: 'Document uploaded to Marketing' },
      { action: 'Indexed', timestamp: '2026-06-25T14:35:00Z', user: 'System', description: 'Parsed and split into 32 vector chunks' },
      { action: 'Viewed', timestamp: '2026-06-28T09:12:00Z', user: 'Jane Smith', description: 'Opened document details panel' }
    ]
  },
  {
    id: 'doc-2',
    name: 'Sales Handbook.docx',
    collection: 'Marketing',
    type: 'docx',
    status: 'Indexed',
    chunksCount: 18,
    lastUpdated: '2026-06-20T10:15:00Z',
    sizeBytes: 854000,
    owner: 'Jane Smith',
    language: 'English',
    pagesCount: 15,
    embeddingModel: 'text-embedding-3-small',
    lastIndexed: '2026-06-20T10:20:00Z',
    averageChunkSize: 450,
    lastRetrieved: '2026-06-27T16:40:00Z',
    retrievalCount: 89,
    activityLog: [
      { action: 'Uploaded', timestamp: '2026-06-20T10:15:00Z', user: 'Jane Smith', description: 'Sales document uploaded' },
      { action: 'Indexed', timestamp: '2026-06-20T10:20:00Z', user: 'System', description: 'Indexed successfully into Qdrant' }
    ]
  },
  {
    id: 'doc-3',
    name: 'Leadership Update Q2.pdf',
    collection: 'HR',
    type: 'pdf',
    status: 'Indexed',
    chunksCount: 8,
    lastUpdated: '2026-06-27T09:00:00Z',
    sizeBytes: 450000,
    owner: 'John Doe',
    language: 'English',
    pagesCount: 4,
    embeddingModel: 'text-embedding-3-small',
    lastIndexed: '2026-06-27T09:05:00Z',
    averageChunkSize: 480,
    lastRetrieved: '2026-06-28T11:05:00Z',
    retrievalCount: 42,
    activityLog: [
      { action: 'Uploaded', timestamp: '2026-06-27T09:00:00Z', user: 'John Doe', description: 'Q2 general leadership outline uploaded' },
      { action: 'Indexed', timestamp: '2026-06-27T09:05:00Z', user: 'System', description: 'Processed into 8 chunks successfully' }
    ]
  },
  {
    id: 'doc-4',
    name: 'Inventory Report Q2.xlsx',
    collection: 'Finance',
    type: 'xlsx',
    status: 'Needs Re-index',
    chunksCount: 54,
    lastUpdated: '2026-06-28T11:00:00Z',
    sizeBytes: 2150000,
    owner: 'Alice Brown',
    language: 'English',
    pagesCount: 1,
    embeddingModel: 'text-embedding-3-small',
    lastIndexed: '2026-06-22T08:00:00Z',
    averageChunkSize: 512,
    lastRetrieved: '2026-06-25T13:45:00Z',
    retrievalCount: 220,
    activityLog: [
      { action: 'Uploaded', timestamp: '2026-06-22T07:50:00Z', user: 'Alice Brown', description: 'Initial file upload' },
      { action: 'Indexed', timestamp: '2026-06-22T08:00:00Z', user: 'System', description: 'Document indexed successfully' },
      { action: 'Re-indexed', timestamp: '2026-06-28T11:00:00Z', user: 'Alice Brown', description: 'Data changed - re-indexing requested' }
    ]
  },
  {
    id: 'doc-5',
    name: 'Engineering Guide.md',
    collection: 'Engineering',
    type: 'md',
    status: 'Processing',
    chunksCount: 0,
    lastUpdated: '2026-06-28T14:50:00Z',
    sizeBytes: 154000,
    owner: 'Bob Wilson',
    language: 'English',
    pagesCount: 3,
    embeddingModel: 'text-embedding-3-small',
    lastIndexed: 'Pending',
    averageChunkSize: 0,
    lastRetrieved: 'Never',
    retrievalCount: 0,
    activityLog: [
      { action: 'Uploaded', timestamp: '2026-06-28T14:50:00Z', user: 'Bob Wilson', description: 'Engineering playbook upload' }
    ]
  },
  {
    id: 'doc-6',
    name: 'HR Policies 2026.txt',
    collection: 'HR',
    type: 'txt',
    status: 'Failed',
    chunksCount: 0,
    lastUpdated: '2026-06-24T16:00:00Z',
    sizeBytes: 92000,
    owner: 'Jane Smith',
    language: 'English',
    pagesCount: 2,
    embeddingModel: 'text-embedding-3-small',
    lastIndexed: 'Failed',
    averageChunkSize: 0,
    lastRetrieved: 'Never',
    retrievalCount: 0,
    activityLog: [
      { action: 'Uploaded', timestamp: '2026-06-24T16:00:00Z', user: 'Jane Smith', description: 'Policies text draft uploaded' },
      { action: 'Failed', timestamp: '2026-06-24T16:01:00Z', user: 'System', description: 'Indexing failed due to text encoding incompatibility' }
    ]
  },
  {
    id: 'doc-7',
    name: 'Product Roadmap.pptx',
    collection: 'Product',
    type: 'pptx',
    status: 'Indexed',
    chunksCount: 45,
    lastUpdated: '2026-06-26T13:40:00Z',
    sizeBytes: 3450000,
    owner: 'Bob Wilson',
    language: 'English',
    pagesCount: 22,
    embeddingModel: 'text-embedding-3-small',
    lastIndexed: '2026-06-26T13:48:00Z',
    averageChunkSize: 500,
    lastRetrieved: '2026-06-28T10:15:00Z',
    retrievalCount: 112,
    activityLog: [
      { action: 'Uploaded', timestamp: '2026-06-26T13:40:00Z', user: 'Bob Wilson', description: 'Roadmap slides uploaded' },
      { action: 'Indexed', timestamp: '2026-06-26T13:48:00Z', user: 'System', description: 'Successfully split slides into vector pages' }
    ]
  },
  {
    id: 'doc-8',
    name: 'Research Findings Q1.pdf',
    collection: 'Research',
    type: 'pdf',
    status: 'Indexed',
    chunksCount: 14,
    lastUpdated: '2026-06-15T09:30:00Z',
    sizeBytes: 980000,
    owner: 'Alice Brown',
    language: 'English',
    pagesCount: 6,
    embeddingModel: 'text-embedding-3-small',
    lastIndexed: '2026-06-15T09:35:00Z',
    averageChunkSize: 450,
    lastRetrieved: '2026-06-22T14:20:00Z',
    retrievalCount: 30,
    activityLog: [
      { action: 'Uploaded', timestamp: '2026-06-15T09:30:00Z', user: 'Alice Brown', description: 'Research paper uploaded' },
      { action: 'Indexed', timestamp: '2026-06-15T09:35:00Z', user: 'System', description: 'Document indexed successfully' }
    ]
  },
  {
    id: 'doc-9',
    name: 'Legal Terms Draft.docx',
    collection: 'Legal',
    type: 'docx',
    status: 'Failed',
    chunksCount: 0,
    lastUpdated: '2026-06-18T11:45:00Z',
    sizeBytes: 120000,
    owner: 'Jane Smith',
    language: 'English',
    pagesCount: 3,
    embeddingModel: 'text-embedding-3-small',
    lastIndexed: 'Failed',
    averageChunkSize: 0,
    lastRetrieved: 'Never',
    retrievalCount: 0,
    activityLog: [
      { action: 'Uploaded', timestamp: '2026-06-18T11:45:00Z', user: 'Jane Smith', description: 'Legal draft document uploaded' },
      { action: 'Failed', timestamp: '2026-06-18T11:47:00Z', user: 'System', description: 'Indexing failed: Document parser error' }
    ]
  },
  {
    id: 'doc-10',
    name: 'Customer Feedback.csv',
    collection: 'Product',
    type: 'csv',
    status: 'Needs Re-index',
    chunksCount: 22,
    lastUpdated: '2026-06-28T12:30:00Z',
    sizeBytes: 45000,
    owner: 'John Doe',
    language: 'English',
    pagesCount: 1,
    embeddingModel: 'text-embedding-3-small',
    lastIndexed: '2026-06-25T15:20:00Z',
    averageChunkSize: 300,
    lastRetrieved: '2026-06-27T08:50:00Z',
    retrievalCount: 75,
    activityLog: [
      { action: 'Uploaded', timestamp: '2026-06-25T15:10:00Z', user: 'John Doe', description: 'CSV file uploaded' },
      { action: 'Indexed', timestamp: '2026-06-25T15:20:00Z', user: 'System', description: 'Indexed successfully' },
      { action: 'Re-indexed', timestamp: '2026-06-28T12:30:00Z', user: 'John Doe', description: 'Data changed - re-indexing requested' }
    ]
  }
];

export const useKnowledgeStore = create<KnowledgeState>((set, get) => {
  const computeCollections = (docs: DocumentItem[]) => {
    const defaultCols = ['Marketing', 'Engineering', 'HR', 'Finance', 'Product', 'Research', 'Legal'];
    const map = new Map<string, number>();
    
    defaultCols.forEach(col => map.set(col, 0));
    
    docs.forEach(doc => {
      const col = doc.collection || 'General';
      map.set(col, (map.get(col) || 0) + 1);
    });

    const list = Array.from(map.entries()).map(([name, count]) => ({
      name,
      count
    }));

    return list;
  };

  return {
    documents: INITIAL_DOCUMENTS,
    collections: computeCollections(INITIAL_DOCUMENTS),
    searchQuery: '',
    collectionFilter: 'all',
    typeFilter: 'all',
    statusFilter: 'all',
    ownerFilter: 'all',
    dateAddedFilter: 'all',
    selectedDocIds: [],
    activeDetailDocId: null,
    detailTab: 'overview',
    pageState: 'content',

    setPageState: (state) => set({ pageState: state }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setCollectionFilter: (collection) => set({ collectionFilter: collection }),
    setTypeFilter: (type) => set({ typeFilter: type }),
    setStatusFilter: (status) => set({ statusFilter: status }),
    setOwnerFilter: (owner) => set({ ownerFilter: owner }),
    setDateAddedFilter: (date) => set({ dateAddedFilter: date }),
    
    toggleDocSelection: (id) => set((state) => {
      const idx = state.selectedDocIds.indexOf(id);
      const next = [...state.selectedDocIds];
      if (idx > -1) {
        next.splice(idx, 1);
      } else {
        next.push(id);
      }
      return { selectedDocIds: next };
    }),

    selectAllDocs: (ids) => set({ selectedDocIds: ids }),
    clearSelection: () => set({ selectedDocIds: [] }),

    addDocument: (doc) => set((state) => {
      const newDoc: DocumentItem = {
        ...doc,
        id: `doc-${crypto.randomUUID()}`,
        lastUpdated: new Date().toISOString(),
        lastIndexed: doc.status === 'Indexed' ? new Date().toISOString() : 'Pending',
        averageChunkSize: doc.status === 'Indexed' ? 512 : 0,
        lastRetrieved: 'Never',
        retrievalCount: 0,
        activityLog: [
          { action: 'Uploaded', timestamp: new Date().toISOString(), user: doc.owner, description: `File uploaded to ${doc.collection}` },
          { action: doc.status === 'Indexed' ? 'Indexed' : 'Queued', timestamp: new Date().toISOString(), user: 'System', description: doc.status === 'Indexed' ? 'Document indexed successfully' : 'Queued for background vector extraction' }
        ]
      };
      const updatedDocs = [newDoc, ...state.documents];
      return {
        documents: updatedDocs,
        collections: computeCollections(updatedDocs)
      };
    }),

    deleteDocuments: (ids) => set((state) => {
      const updatedDocs = state.documents.filter(d => !ids.includes(d.id));
      const nextActiveDocId = state.activeDetailDocId && ids.includes(state.activeDetailDocId) ? null : state.activeDetailDocId;
      return {
        documents: updatedDocs,
        collections: computeCollections(updatedDocs),
        selectedDocIds: state.selectedDocIds.filter(id => !ids.includes(id)),
        activeDetailDocId: nextActiveDocId
      };
    }),

    reindexDocuments: (ids) => set((state) => {
      const updatedDocs = state.documents.map(d => {
        if (ids.includes(d.id)) {
          return {
            ...d,
            status: 'Processing' as const,
            lastUpdated: new Date().toISOString(),
            activityLog: [
              ...d.activityLog,
              { action: 'Re-indexed', timestamp: new Date().toISOString(), user: 'System', description: 'Re-indexing job triggered by client action' }
            ]
          };
        }
        return d;
      });

      // Simulate completion
      setTimeout(() => {
        set((currState) => {
          const finalDocs = currState.documents.map(d => {
            if (ids.includes(d.id) && d.status === 'Processing') {
              return {
                ...d,
                status: 'Indexed' as const,
                chunksCount: d.chunksCount || Math.floor(Math.random() * 40) + 10,
                averageChunkSize: 512,
                lastIndexed: new Date().toISOString(),
                activityLog: [
                  ...d.activityLog,
                  { action: 'Indexed', timestamp: new Date().toISOString(), user: 'System', description: 'Background vector indexing succeeded' }
                ]
              };
            }
            return d;
          });
          return {
            documents: finalDocs,
            collections: computeCollections(finalDocs)
          };
        });
      }, 4000);

      return {
        documents: updatedDocs,
        collections: computeCollections(updatedDocs)
      };
    }),

    moveToCollection: (ids, targetCollection) => set((state) => {
      const updatedDocs = state.documents.map(d => {
        if (ids.includes(d.id)) {
          return {
            ...d,
            collection: targetCollection,
            activityLog: [
              ...d.activityLog,
              { action: 'Re-indexed', timestamp: new Date().toISOString(), user: 'System', description: `Moved to collection: ${targetCollection}` }
            ]
          };
        }
        return d;
      });
      return {
        documents: updatedDocs,
        collections: computeCollections(updatedDocs)
      };
    }),

    addCollection: (name) => set((state) => {
      if (state.collections.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        return {};
      }
      return {
        collections: [...state.collections, { name, count: 0 }]
      };
    }),

    setActiveDetailDocId: (id) => set({ activeDetailDocId: id }),
    setDetailTab: (tab) => set({ detailTab: tab }),

    getFilteredDocuments: () => {
      const { documents, searchQuery, collectionFilter, typeFilter, statusFilter, ownerFilter, dateAddedFilter } = get();
      return documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCollection = collectionFilter === 'all' || doc.collection === collectionFilter;
        const matchesType = typeFilter === 'all' || doc.type === typeFilter.toLowerCase();
        const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
        
        // Owner Filter
        let matchesOwner = true;
        if (ownerFilter !== 'all') {
          matchesOwner = doc.owner === ownerFilter;
        }

        // Date Filter
        let matchesDate = true;
        if (dateAddedFilter !== 'all') {
          const docDate = new Date(doc.lastUpdated);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - docDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (dateAddedFilter === 'today') {
            matchesDate = diffDays <= 1;
          } else if (dateAddedFilter === 'week') {
            matchesDate = diffDays <= 7;
          } else if (dateAddedFilter === 'month') {
            matchesDate = diffDays <= 30;
          }
        }

        return matchesSearch && matchesCollection && matchesType && matchesStatus && matchesOwner && matchesDate;
      });
    }
  };
});
