import { formatUiLabel } from '../../utils/formatUiLabel';

interface FieldRowProps {
  label: string;
  value: string;
  wide?: boolean;
}

const FieldRow = ({ label, value }: FieldRowProps) => (
  <div className="flex items-center gap-2">
    <span className="ui-label w-[88px] flex-shrink-0 leading-tight">{formatUiLabel(label)}</span>
    <div className="flex-1 min-w-0 bg-surface-0 border border-border-default rounded-ui-sm px-3 h-10 flex items-center hover:border-border-strong transition-colors">
      <input
        type="text"
        defaultValue={value}
        className="bg-transparent ui-value w-full outline-none placeholder:text-text-disabled truncate"
        readOnly
      />
    </div>
  </div>
);

export default FieldRow;
