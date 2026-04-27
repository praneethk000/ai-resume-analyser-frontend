import styles from './StepIndicator.module.css';

const steps = [
  { number: 1, label: 'Upload Resume' },
  { number: 2, label: 'Job Description' },
  { number: 3, label: 'Run Analysis' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        return (
          <div key={step.number} className={styles.stepWrapper}>
            <div className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
              <div className={styles.circle}>
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <span className={styles.label}>{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`${styles.connector} ${isCompleted ? styles.connectorDone : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
