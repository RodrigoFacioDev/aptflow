/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Icons/Logo";
import OndaIcon from "@/components/Icons/OndaIcon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/supabse";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// Schema de validação atualizado
const formSchema = z
  .object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
    email: z.string().email("E-mail inválido"),
    location: z.string().min(1, "Campo obrigatório"),
    billing: z.string().min(1, "Campo obrigatório"),
    foundUs: z.string().min(1, "Campo obrigatório"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres."),
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
      message: "As senhas devem coincidir.",
      path: ["confirmPassword"],
    }
  );

export default function Register() {
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const form = useForm({
    resolver: zodResolver(formSchema),
    shouldUnregister: false, // Mantém os valores dos campos ao mudar de passo
    defaultValues: {
      name: "",
      email: "",
      location: "",
      billing: "",
      foundUs: "",
      password: "",
      confirmPassword: "",
    },
  });
  const showError = (message: string) => {
    setErrorMessage(message);

    // Remove a mensagem após 3 segundos
    setTimeout(() => {
      setErrorMessage(null);
    }, 3000);
  };

  const validateStep = async () => {
    const stepFields = {
      1: ["name", "email"],
      2: ["location", "billing"],
      3: ["foundUs"],
      4: [], // Não valida automaticamente o step 4
    }[step];
    //@ts-ignore
    return await form.trigger(stepFields);
  };

  const nextStep = async () => {
    const isValid = await validateStep();
    if (isValid) setStep(step + 1);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: any) => {
    console.log(values);
    const { error: errorRegister } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });
    if (errorRegister) {
      if (errorRegister.code === "user_already_exists") {
        showError("Esse usuário já existe"); // Define a mensagem de erro
      }
      return; // Para a execução
    }

    function formattedNumber(value: string) {
      if (!value) return 0; // Retorna 0 caso o valor seja inválido
      return parseFloat(
        value.replace("R$", "").trim().replace(".", "").replace(",", ".")
      );
    }

    // Exemplo de uso
    const billing = values.billing;
    const floatValue = formattedNumber(billing);

    const { data: addInfos, error } = await supabase
      .from("info_users")
      .insert([
        {
          quant_accommodations: values.location,
          invoicing: floatValue,
          capture: values.foundUs,
        },
      ])
      .select();
    if (error) {
      showError(error.message);
    }
    console.log(error, addInfos);
  };

  useEffect(() => {
    const calculateProgress = (step: number, total: number) => {
      if (total === 0) return 0;
      return Math.round((step / total) * 100);
    };

    setProgress(calculateProgress(step, 4));
  }, [step]);
  return (
    <div className="flex h-screen w-screen bg-background text-white flex-col md:flex-row">
      {/* Lado esquerdo - Logo */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-foreground relative overflow-hidden">
        <OndaIcon className="absolute inset-0 w-full h-full " />
        <Logo className="w-[350px] h-60 relative z-10" />
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
        {errorMessage && (
          <Alert variant="destructive" className="mb-5 w-full max-w-md">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <Logo className="mb-6 w-32 h-32 md:hidden" />
        <div className="w-full max-w-md">
          <Progress value={progress} className="mb-2 w-full" />

          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-brand mr-2"></div>
            <h1 className="text-3xl font-bold">Cadastro</h1>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <>
                  <p>
                    Digite seu nome e o e-mail que você mais utiliza para
                    contato.
                  </p>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="E-mail" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <p>
                    Nos ajude a entender melhor o seu negócio. Informe a
                    quantidade de locações e o faturamento médio mensal:
                  </p>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade de locações</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a quantidade" />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5+">5 ou mais</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faturamento mensal</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Informe seu faturamento"
                            {...field}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, ""); // Remove não números
                              value = (Number(value) / 100).toLocaleString(
                                "pt-BR",
                                {
                                  style: "currency",
                                  currency: "BRL",
                                }
                              );
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {step === 3 && (
                <FormField
                  control={form.control}
                  name="foundUs"
                  render={({ field }) => (
                    <FormItem>
                      <p>
                        Nos ajude a entender melhor como chegou até nós.
                        Selecione o canal pelo qual nos encontrou:
                      </p>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="google">Google</SelectItem>
                            <SelectItem value="amigos">
                              Indicação de amigos
                            </SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {step === 4 && (
                <>
                  <p>
                    Crie uma senha segura e confirme para garantir o acesso à
                    sua conta.
                  </p>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Senha"
                            {...field}
                            onBlur={() => form.trigger("password")} // Só valida ao sair do campo
                          />
                        </FormControl>
                        {form.formState.touchedFields.password && (
                          <FormMessage />
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Confirme a senha
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirme a senha"
                            {...field}
                            onBlur={() => form.trigger("confirmPassword")} // Só valida ao sair do campo
                          />
                        </FormControl>
                        {form.formState.touchedFields.confirmPassword && (
                          <FormMessage />
                        )}
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="flex justify-between">
                {step > 1 && (
                  <Button type="button" onClick={() => setStep(step - 1)}>
                    Voltar
                  </Button>
                )}
                {step < 4 ? (
                  <Button type="button" onClick={nextStep}>
                    Próximo
                  </Button>
                ) : (
                  <Button type="submit">Finalizar</Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
