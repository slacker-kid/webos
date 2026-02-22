'use client';

import React, { useState, useEffect, useCallback } from 'react';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  const clear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setPrevValue(null);
    setOperator(null);
    setResetNext(false);
  }, []);

  const backspace = useCallback(() => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  }, []);

  const inputDigit = useCallback((digit: string) => {
    if (resetNext) {
      setDisplay(digit);
      setResetNext(false);
    } else {
      setDisplay(prev => prev === '0' ? digit : prev + digit);
    }
  }, [resetNext]);

  const inputDecimal = useCallback(() => {
    if (resetNext) {
      setDisplay('0.');
      setResetNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(prev => prev + '.');
    }
  }, [resetNext, display]);

  const toggleSign = useCallback(() => {
    setDisplay(prev => {
      if (prev === '0') return prev;
      return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
    });
  }, []);

  const percentage = useCallback(() => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay((val / 100).toString());
    }
  }, [display]);

  const calculate = useCallback((a: number, op: string, b: number): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : NaN;
      default: return b;
    }
  }, []);

  const handleOperator = useCallback((op: string) => {
    const current = parseFloat(display);
    if (prevValue !== null && operator && !resetNext) {
      const result = calculate(prevValue, operator, current);
      const resultStr = isNaN(result) ? 'Error' : formatNumber(result);
      setDisplay(resultStr);
      setPrevValue(isNaN(result) ? null : result);
      setExpression(`${formatNumber(result)} ${op}`);
    } else {
      setPrevValue(current);
      setExpression(`${display} ${op}`);
    }
    setOperator(op);
    setResetNext(true);
  }, [display, prevValue, operator, calculate]);

  const equals = useCallback(() => {
    if (prevValue === null || !operator) return;
    const current = parseFloat(display);
    const result = calculate(prevValue, operator, current);
    const resultStr = isNaN(result) ? 'Error' : formatNumber(result);
    setExpression(`${formatNumber(prevValue)} ${operator} ${display} =`);
    setDisplay(resultStr);
    setPrevValue(null);
    setOperator(null);
    setResetNext(true);
  }, [prevValue, operator, display, calculate]);

  function formatNumber(n: number): string {
    if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toString();
    const s = n.toPrecision(10);
    return parseFloat(s).toString();
  }

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
      else if (e.key === '.') inputDecimal();
      else if (e.key === '+') handleOperator('+');
      else if (e.key === '-') handleOperator('-');
      else if (e.key === '*') handleOperator('*');
      else if (e.key === '/') { e.preventDefault(); handleOperator('/'); }
      else if (e.key === 'Enter' || e.key === '=') equals();
      else if (e.key === 'Escape') clear();
      else if (e.key === 'Backspace') backspace();
      else if (e.key === '%') percentage();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [inputDigit, inputDecimal, handleOperator, equals, clear, backspace, percentage]);

  const Button: React.FC<{ label: string; onClick: () => void; className?: string; span?: number }> = ({ label, onClick, className = '', span = 1 }) => (
    <button
      onClick={onClick}
      className={`h-14 rounded-lg font-semibold text-lg transition-all active:scale-95 ${className}`}
      style={span > 1 ? { gridColumn: `span ${span}` } : undefined}
    >
      {label}
    </button>
  );

  const opStyle = 'bg-amber-600 hover:bg-amber-500 text-white';
  const numStyle = 'bg-gray-700 hover:bg-gray-600 text-white';
  const funcStyle = 'bg-gray-500 hover:bg-gray-400 text-black';

  return (
    <div className="flex flex-col h-full bg-gray-900 p-4">
      {/* Display */}
      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <div className="text-right text-gray-400 text-sm h-5 truncate">{expression}</div>
        <div className="text-right text-white text-4xl font-light tracking-wide truncate mt-1">
          {display}
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        <Button label="C" onClick={clear} className={funcStyle} />
        <Button label="+/-" onClick={toggleSign} className={funcStyle} />
        <Button label="%" onClick={percentage} className={funcStyle} />
        <Button label="÷" onClick={() => handleOperator('/')} className={opStyle} />

        <Button label="7" onClick={() => inputDigit('7')} className={numStyle} />
        <Button label="8" onClick={() => inputDigit('8')} className={numStyle} />
        <Button label="9" onClick={() => inputDigit('9')} className={numStyle} />
        <Button label="×" onClick={() => handleOperator('*')} className={opStyle} />

        <Button label="4" onClick={() => inputDigit('4')} className={numStyle} />
        <Button label="5" onClick={() => inputDigit('5')} className={numStyle} />
        <Button label="6" onClick={() => inputDigit('6')} className={numStyle} />
        <Button label="-" onClick={() => handleOperator('-')} className={opStyle} />

        <Button label="1" onClick={() => inputDigit('1')} className={numStyle} />
        <Button label="2" onClick={() => inputDigit('2')} className={numStyle} />
        <Button label="3" onClick={() => inputDigit('3')} className={numStyle} />
        <Button label="+" onClick={() => handleOperator('+')} className={opStyle} />

        <Button label="0" onClick={() => inputDigit('0')} className={numStyle} span={2} />
        <Button label="." onClick={inputDecimal} className={numStyle} />
        <Button label="=" onClick={equals} className="bg-blue-600 hover:bg-blue-500 text-white" />
      </div>
    </div>
  );
};

export default Calculator;
