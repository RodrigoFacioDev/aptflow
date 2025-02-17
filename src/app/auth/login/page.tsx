"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import Logo from "@/components/Icons/Logo";
import GoogleIcon from "@/components/Icons/GoogleIcon";
import OndaIcon from "@/components/Icons/OndaIcon";
import { supabase } from "@/lib/supabase/supabse";
import Link from "next/link";

const formSchema = z.object({
  login: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Deve conter 8 caracteres",
  }),
});

export default function Login() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { login: "", password: "" },
  });

  // Função para exibir erro e limpar após 3 segundos
  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: any) => {
    console.log(values);

    const data = {
      email: values.login as string,
      password: values.password as string,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      showError("Usuário ou senha inválidos.");
      return;
    }

    redirect("/private/account");
  };

  return (
    <div className="flex h-screen w-screen bg-background text-white flex-col md:flex-row">
      {/* Lado esquerdo - Logo */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-foreground relative overflow-hidden">
        <OndaIcon className="absolute inset-0 w-full h-full " />
        <Logo className="w-[350px] h-60 relative z-10" />
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
        <Logo className="mb-6 w-32 h-32 md:hidden" />
        <div className="w-full max-w-md">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-brand mr-2"></div>
            <h1 className="text-3xl font-bold">Bem-vindo de volta!</h1>
          </div>

          {/* Exibir alerta de erro se houver */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="login"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entre com seu login e senha </FormLabel>
                    <FormControl>
                      <Input placeholder="E-mail ou CPF" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Senha" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="default" size="full">
                Entrar
              </Button>
            </form>
          </Form>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-600"></div>
            <span className="px-3 text-sm">OU</span>
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
          >
            <GoogleIcon width="20px" height="20px" /> Continuar com Google
          </Button>

          <div className="text-center mt-6 text-sm">
            Ainda não tem conta?{" "}
            <Link
              href="/auth/register"
              className="text-green-400 cursor-pointer"
            >
              Cadastre-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
