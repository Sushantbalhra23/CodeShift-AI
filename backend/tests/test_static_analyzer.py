import pytest
from app.sandbox.static_analyzer import StaticAnalyzer


def test_python_ast_valid():
    py_code = """
def add(a: int, b: int) -> int:
    return a + b

class Calculator:
    def multiply(self, x: int, y: int) -> int:
        return x * y
"""
    result = StaticAnalyzer.validate_code(py_code, "python")
    assert result.is_valid is True
    assert "Calculator" in result.classes
    assert "add" in result.functions
    assert "multiply" in result.functions
    assert result.node_count > 0


def test_python_ast_syntax_error():
    bad_code = "def broken_syntax(x\n    return x +"
    result = StaticAnalyzer.validate_code(bad_code, "python")
    assert result.is_valid is False
    assert result.error_message is not None
    assert "SyntaxError" in result.error_message


def test_java_ast_valid():
    java_code = """
package com.example;

public class MathUtils {
    public static int square(int n) {
        return n * n;
    }
}
"""
    result = StaticAnalyzer.validate_code(java_code, "java")
    assert result.is_valid is True
    assert "MathUtils" in result.classes
    assert "square" in result.functions
    assert result.node_count > 0


def test_java_ast_method_snippet():
    snippet = """
public static int doubleValue(int n) {
    return n * 2;
}
"""
    result = StaticAnalyzer.validate_code(snippet, "java")
    assert result.is_valid is True
    assert "doubleValue" in result.functions


def test_java_ast_syntax_error():
    bad_java = "public class Bad { int x = ; }"
    result = StaticAnalyzer.validate_code(bad_java, "java")
    assert result.is_valid is False
    assert result.error_message is not None
