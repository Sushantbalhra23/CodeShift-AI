import ast
import re
from typing import List, Optional
import javalang
from app.schemas.evaluation import ASTValidationResult


class StaticAnalyzer:
    """Safe, host-level AST static analyzer without code execution."""

    @classmethod
    def validate_code(cls, code: str, language: str) -> ASTValidationResult:
        lang = language.strip().lower()
        if lang == "python":
            return cls.validate_python(code)
        elif lang == "java":
            return cls.validate_java(code)
        else:
            return ASTValidationResult(
                is_valid=False,
                language=language,
                error_message=f"Unsupported language for AST validation: {language}",
            )

    @classmethod
    def validate_python(cls, code: str) -> ASTValidationResult:
        clean_code = cls._strip_markdown(code)
        try:
            tree = ast.parse(clean_code)
            
            classes = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
            functions = [node.name for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))]
            node_count = sum(1 for _ in ast.walk(tree))
            
            return ASTValidationResult(
                is_valid=True,
                language="python",
                error_message=None,
                node_count=node_count,
                symbols=classes + functions,
                classes=classes,
                functions=functions,
            )
        except SyntaxError as e:
            return ASTValidationResult(
                is_valid=False,
                language="python",
                error_message=f"SyntaxError on line {e.lineno}: {e.msg}",
                node_count=0,
            )
        except Exception as e:
            return ASTValidationResult(
                is_valid=False,
                language="python",
                error_message=f"AST Parse Exception: {str(e)}",
                node_count=0,
            )

    @classmethod
    def validate_java(cls, code: str) -> ASTValidationResult:
        clean_code = cls._strip_markdown(code)
        
        # Try direct parse
        try:
            tree = javalang.parse.parse(clean_code)
            return cls._extract_java_tree_info(tree)
        except (javalang.parser.JavaSyntaxError, IndexError) as err_direct:
            # If it's a snippet (e.g. methods only without a public class), wrap in a synthetic class
            wrapped_code = f"public class SyntheticWrapper {{\n{clean_code}\n}}"
            try:
                tree = javalang.parse.parse(wrapped_code)
                return cls._extract_java_tree_info(tree)
            except Exception:
                # Return the original syntax error
                return ASTValidationResult(
                    is_valid=False,
                    language="java",
                    error_message=f"Java Syntax Error: {str(err_direct)}",
                    node_count=0,
                )
        except Exception as e:
            return ASTValidationResult(
                is_valid=False,
                language="java",
                error_message=f"Java AST Parser Error: {str(e)}",
                node_count=0,
            )

    @classmethod
    def _extract_java_tree_info(cls, tree: javalang.tree.CompilationUnit) -> ASTValidationResult:
        classes = []
        methods = []
        node_count = 0

        for path, node in tree:
            node_count += 1
            if isinstance(node, (javalang.tree.ClassDeclaration, javalang.tree.InterfaceDeclaration)):
                if node.name != "SyntheticWrapper":
                    classes.append(node.name)
            elif isinstance(node, javalang.tree.MethodDeclaration):
                methods.append(node.name)

        return ASTValidationResult(
            is_valid=True,
            language="java",
            error_message=None,
            node_count=node_count,
            symbols=classes + methods,
            classes=classes,
            functions=methods,
        )

    @staticmethod
    def _strip_markdown(code: str) -> str:
        code = code.strip()
        # Remove ```python or ```java blocks if present
        pattern = r"^```[a-zA-Z]*\n?(.*?)\n?```$"
        match = re.match(pattern, code, re.DOTALL)
        if match:
            return match.group(1).strip()
        return code
