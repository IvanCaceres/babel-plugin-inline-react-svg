import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

let globalId = 0;

const Context = React.createContext(() => `svg-id-${globalId++}`);

export default function AutoIdProvider({ children, getId: customGetId }) {
  const nextId = useRef(0);

  const getId = useCallback(
    () => (customGetId ? customGetId(nextId) : `svg-id-${nextId.current++}`),
    [customGetId],
  );

  return <Context.Provider value={getId}>{children}</Context.Provider>;
}

AutoIdProvider.Context = Context;

AutoIdProvider.propTypes = {
  children: PropTypes.node.isRequired,
  getId: PropTypes.func,
};
