"use client";

interface Props {
  name: string;
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export function AutoSubmitSelect({ name, defaultValue, className, children }: Props) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      onChange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()}
      className={className}
    >
      {children}
    </select>
  );
}
