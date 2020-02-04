import { useContext, useState } from 'react';
import AutoIdProvider from './AutoIdProvider';

export default function useId(customId) {
  const getId = useContext(AutoIdProvider.Context);
  const [autoId] = useState(getId);
  return customId || autoId;
}
