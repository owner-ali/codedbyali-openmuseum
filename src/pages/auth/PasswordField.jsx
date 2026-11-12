import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Field from '../../components/common/Field';

export default function PasswordField({ id, label, error, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Field id={id} label={label} type={show ? 'text' : 'password'} error={error} className="pr-12" {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-1 top-[2.15rem] flex h-11 w-11 items-center justify-center text-muted hover:text-white"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
