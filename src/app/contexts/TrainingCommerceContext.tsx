import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { TrainingCourseDTO } from '@app/types/training.dto';

interface TrainingCartItem {
  courseId: string;
  title: string;
  level: string;
  format: string;
  duration: number;
  price: number;
}

export type TrainingLearningStatus = 'not_started' | 'in_progress' | 'completed';

export interface TrainingLearningRecord {
  courseId: string;
  title: string;
  status: TrainingLearningStatus;
  progress: number;
  purchaseDate: string;
  completionDate?: string;
  certificateId?: string;
}

interface TrainingCommerceContextType {
  cartItems: TrainingCartItem[];
  activatedTrainings: TrainingLearningRecord[];
  completedTrainings: TrainingLearningRecord[];
  certificatesEarned: TrainingLearningRecord[];
  cartTotal: number;
  cartCount: number;
  addToCart: (course: TrainingCourseDTO) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  completeCheckout: () => { purchasedCount: number; purchasedTitles: string[] };
  continueTraining: (courseId: string) => void;
  completeTraining: (courseId: string) => void;
}

const TRAINING_COMMERCE_STORAGE_KEY = 'assortis_training_commerce';

interface PersistedTrainingCommerce {
  cartItems: TrainingCartItem[];
  learningRecords: TrainingLearningRecord[];
}

const TrainingCommerceContext = createContext<TrainingCommerceContextType | undefined>(undefined);

function createCartItem(course: TrainingCourseDTO): TrainingCartItem {
  return {
    courseId: course.id,
    title: course.title,
    level: course.level,
    format: course.format,
    duration: course.duration,
    price: course.price,
  };
}

function createLearningRecord(item: TrainingCartItem): TrainingLearningRecord {
  return {
    courseId: item.courseId,
    title: item.title,
    status: 'not_started',
    progress: 0,
    purchaseDate: new Date().toISOString(),
  };
}

const seedLearningRecords: TrainingLearningRecord[] = [
  {
    courseId: 'CRS-001',
    title: 'Advanced Project Management for Development',
    status: 'in_progress',
    progress: 65,
    purchaseDate: '2024-02-01T08:30:00Z',
  },
  {
    courseId: 'CRS-004',
    title: 'Gender Mainstreaming in Development',
    status: 'completed',
    progress: 100,
    purchaseDate: '2024-01-15T09:00:00Z',
    completionDate: '2024-02-10T14:00:00Z',
    certificateId: 'CERT-TRAINING-2024-004',
  },
];

export function TrainingCommerceProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<TrainingCartItem[]>([]);
  const [learningRecords, setLearningRecords] = useState<TrainingLearningRecord[]>(seedLearningRecords);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TRAINING_COMMERCE_STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as PersistedTrainingCommerce;
      setCartItems(Array.isArray(parsed.cartItems) ? parsed.cartItems : []);
      setLearningRecords(
        Array.isArray(parsed.learningRecords) && parsed.learningRecords.length > 0
          ? parsed.learningRecords
          : seedLearningRecords,
      );
    } catch {
      setCartItems([]);
      setLearningRecords(seedLearningRecords);
    }
  }, []);

  useEffect(() => {
    const payload: PersistedTrainingCommerce = {
      cartItems,
      learningRecords,
    };

    localStorage.setItem(TRAINING_COMMERCE_STORAGE_KEY, JSON.stringify(payload));
  }, [cartItems, learningRecords]);

  const addToCart = (course: TrainingCourseDTO) => {
    setCartItems((prev) => {
      if (prev.some((item) => item.courseId === course.id)) {
        return prev;
      }
      return [...prev, createCartItem(course)];
    });
  };

  const removeFromCart = (courseId: string) => {
    setCartItems((prev) => prev.filter((item) => item.courseId !== courseId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const completeCheckout = () => {
    const purchasedTitles = cartItems.map((item) => item.title);

    setLearningRecords((prev) => {
      const existingIds = new Set(prev.map((entry) => entry.courseId));
      const nextRecords = [...prev];

      for (const item of cartItems) {
        if (!existingIds.has(item.courseId)) {
          nextRecords.push(createLearningRecord(item));
        }
      }

      return nextRecords;
    });

    setCartItems([]);

    return {
      purchasedCount: purchasedTitles.length,
      purchasedTitles,
    };
  };

  const continueTraining = (courseId: string) => {
    setLearningRecords((prev) =>
      prev.map((record) => {
        if (record.courseId !== courseId || record.status === 'completed') {
          return record;
        }

        const nextProgress = Math.min(record.progress + 15, 95);
        return {
          ...record,
          progress: nextProgress,
          status: 'in_progress',
        };
      }),
    );
  };

  const completeTraining = (courseId: string) => {
    setLearningRecords((prev) =>
      prev.map((record) => {
        if (record.courseId !== courseId) {
          return record;
        }

        return {
          ...record,
          status: 'completed',
          progress: 100,
          completionDate: record.completionDate ?? new Date().toISOString(),
          certificateId: record.certificateId ?? `CERT-${record.courseId}-${new Date().getFullYear()}`,
        };
      }),
    );
  };

  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price, 0), [cartItems]);
  const activatedTrainings = useMemo(
    () => learningRecords.filter((record) => record.status !== 'completed'),
    [learningRecords],
  );
  const completedTrainings = useMemo(
    () => learningRecords.filter((record) => record.status === 'completed'),
    [learningRecords],
  );

  const value: TrainingCommerceContextType = {
    cartItems,
    activatedTrainings,
    completedTrainings,
    certificatesEarned: completedTrainings,
    cartTotal,
    cartCount: cartItems.length,
    addToCart,
    removeFromCart,
    clearCart,
    completeCheckout,
    continueTraining,
    completeTraining,
  };

  return <TrainingCommerceContext.Provider value={value}>{children}</TrainingCommerceContext.Provider>;
}

export function useTrainingCommerce() {
  const context = useContext(TrainingCommerceContext);
  if (!context) {
    throw new Error('useTrainingCommerce must be used within TrainingCommerceProvider');
  }
  return context;
}
